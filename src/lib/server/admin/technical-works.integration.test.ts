import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { describe,expect,it } from 'vitest';
import { publicEntryMetadataSql,entryMetadataFromRow } from '$lib/server/public-entry-metadata';
import { parseEntityForm } from './validation';
import { entityForms } from './entity-definitions';
import { validateEntitySemantics } from './crud';

function migratedFixture() {
  const db=new DatabaseSync(':memory:');
  // Reconstruye la estructura previa a 040 a partir de la fotografía vigente.
  let schema=readFileSync('db/schema.sql','utf8').split('-- Modelo editorial 040–042:')[0]
    .replace('  project_type TEXT, -- Compatibilidad de lectura; la convocatoria se escribe en programme_code.\n','')
    .replace(/CREATE TABLE technical_works \([\s\S]*?CREATE INDEX idx_technical_works_project[^;]+;/,'')
    .replace(/CREATE TABLE technical_work_projects \([\s\S]*?CREATE INDEX idx_technical_work_projects_project[^;]+;/,'')
    .replace("UNION ALL\nSELECT 'technical_works', id, title, date_start FROM technical_works\n",'')
    .replaceAll("'technical_works', 'projects'","'projects'")
    .replace('programme_code TEXT REFERENCES type_vocab(code),\n  nature TEXT REFERENCES type_vocab(code),\n  contribution_es TEXT,\n  contribution_en TEXT,','project_type TEXT REFERENCES type_vocab(code),');
  db.exec(schema);
  db.exec(`INSERT INTO type_vocab(code,domain,label_es,label_en) VALUES
    ('national_rd','project_type','Nacional','National'),('transfer','project_type','Transferencia','Transfer'),
    ('internal','project_type','Institucional','Internal'),('external','project_type','Externo','External'),
    ('team_member','project_role','Equipo','Team'),('collaborator','project_role','Colaborador externo','Collaborator'),
    ('website','link_type','Web','Website'),('doc_certificate','document_type','Certificado','Certificate');
    INSERT INTO projects(id,title,acronym,project_type,role,project_code) VALUES
    (3,'Proyecto METADRAMA','METADRAMA','national_rd','team_member','PID2024-161619NA-I00');
    INSERT INTO projects(id,title,project_type,role,date_start,description_short_es) VALUES
    (7,'Edición de Fray Andrés','external','team_member','2024',NULL),
    (8,'ETSO','external','collaborator','2022','Preparación de archivos para entrenar un modelo');
    INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('projects',3,1),('projects',7,1),('projects',8,1);
    INSERT INTO portfolio_items VALUES('edicion-digital-corpus','projects',7,10,0);
    INSERT INTO tags(id,slug,label_es,label_en) VALUES(1,'archivo','Archivo','Archive');
    INSERT INTO entity_tags VALUES('projects',7,1);`);
  for(const name of ['037_saved_cvs.sql','038_cv_header_and_project_roles.sql','039_cv_affiliation_and_website.sql']) db.exec(readFileSync(`db/migrations/${name}`,'utf8').replace("SELECT 'skills', id, category, NULL FROM skills","SELECT 'skills', id, name_es, NULL FROM skills"));
  db.exec(`INSERT INTO cv_profiles(id,name,title) VALUES(1,'ARCHives/ARCHiving','CV');
    INSERT INTO cv_blocks(id,cv_id,kind,title,body,sort_order) VALUES
      (1,1,'text','Mi texto','Texto propio que debe conservarse',0),
      (2,1,'text','Experiencia y aportación al proyecto','Texto propio con ñ y edición.',1),
      (3,1,'entries','Proyectos de investigación','',2),
      (4,1,'entries','Publicaciones','',3);
    INSERT INTO cv_block_entries(block_id,entity_type,entity_id,commentary,sort_order) VALUES(3,'projects',7,'Comentario adaptado',0),(3,'projects',8,'',1),(3,'projects',3,'',2);
    INSERT INTO cv_exports(cv_id,profile_version,snapshot_json) VALUES(1,1,'{"entrega":"histórica con ñ"}');
    INSERT INTO links(entity_type,entity_id,link_type,url) VALUES('projects',7,'website','https://example.com');
    INSERT INTO documents(entity_type,entity_id,document_type,url,notes_private) VALUES('projects',7,'doc_certificate','https://example.com/certificado','Nota privada');
    INSERT INTO funding_awards(id,title) VALUES(1,'Ayuda personal');
    INSERT INTO funding_relations(funding_award_id,entity_type,entity_id) VALUES(1,'projects',8);`);
  db.exec('PRAGMA foreign_keys=ON;');
  for(const name of ['040_technical_works_and_project_context.sql','041_reclassify_technical_experience.sql','042_complete_benson_context_and_cv_wording.sql','043_project_programme_read_compatibility.sql']) db.exec(readFileSync(`db/migrations/${name}`,'utf8').replace("SELECT 'skills', id, category, NULL FROM skills","SELECT 'skills', id, name_es, NULL FROM skills"));
  db.exec('CREATE TABLE technical_work_projects(technical_work_id INTEGER,project_id INTEGER);');
  return db;
}

describe('Trabajos técnicos y profesionales',()=>{
  it('simplifica las aportaciones y registra los trabajos PROLOPE sin duplicar labores',()=>{
    const db=migratedFixture();
    try {
      db.exec("INSERT INTO projects(id,title,programme_code) VALUES(1,'PROLOPE II','generation_knowledge');");
      db.exec("INSERT INTO projects(id,title,programme_code) VALUES(2,'PROLOPE I','generation_knowledge'); INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('projects',1,1),('projects',2,1);");
      db.exec("INSERT INTO technical_works(title,responsibility,contribution_es,modality) VALUES('Otro trabajo','Coordinación de datos','Descripción original','own_initiative');");
      db.exec(readFileSync('db/migrations/048_simplify_technical_work_contributions.sql','utf8'));
      expect(db.prepare('PRAGMA table_info(technical_works)').all().some(c=>c.name==='responsibility')).toBe(false);
      expect(db.prepare("SELECT contribution_es FROM technical_works WHERE title='Otro trabajo'").get()).toMatchObject({contribution_es:'Descripción original\n\nCoordinación de datos'});
      // El nuevo trabajo anterior ocupa el 11; quita solo esta fila de prueba antes de la migración de datos.
      db.exec("DELETE FROM technical_works WHERE title='Otro trabajo'");
      db.exec('DROP TABLE technical_work_projects;');
      db.exec(readFileSync('db/migrations/049_prolope_technical_works.sql','utf8'));
      expect(db.prepare('SELECT id,project_id,modality,date_start FROM technical_works WHERE id IN (11,12)').all()).toEqual([
        {id:11,project_id:1,modality:'technical_project_work',date_start:'2025-02'},
        {id:12,project_id:1,modality:'technical_project_work',date_start:'2025-02'}
      ]);
      const sql=publicEntryMetadataSql('e');
      expect(entryMetadataFromRow(db.prepare(`SELECT e.entity_type,e.title_cache,${sql.select} FROM entries e ${sql.joins} WHERE e.entity_type='technical_works' AND e.entity_id=11`).get()!)).toMatchObject({kind:'professional',modality_es:'Trabajo técnico en proyecto de investigación'});
      expect(db.prepare('SELECT project_id FROM technical_work_projects WHERE technical_work_id=11 ORDER BY project_id').all()).toEqual([{project_id:1},{project_id:2}]);
      db.exec("UPDATE entry_controls SET is_public=0 WHERE entity_type='projects' AND entity_id=2");
      const metadata=entryMetadataFromRow(db.prepare(`SELECT e.entity_type,${sql.select} FROM entries e ${sql.joins} WHERE e.entity_type='technical_works' AND e.entity_id=11`).get()!);
      expect(metadata?.kind==='professional' && metadata.projects?.map(p=>p.title)).toEqual(['PROLOPE II']);
      expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
      expect(db.prepare('SELECT snapshot_json FROM cv_exports').get()).toMatchObject({snapshot_json:'{"entrega":"histórica con ñ"}'});
    } finally { db.close(); }
  });
  it('migra las selecciones y relaciones conservando visibilidad, comentarios e historial',()=>{
    const db=migratedFixture();
    try {
      expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
      expect(db.prepare('SELECT id FROM projects ORDER BY id').all()).toEqual([{id:3}]);
      expect(db.prepare("SELECT commentary FROM cv_block_entries WHERE entity_type='technical_works' AND entity_id=7").get()).toMatchObject({commentary:'Comentario adaptado'});
      for(const table of ['portfolio_items','entity_tags','links','documents']) expect(db.prepare(`SELECT entity_type FROM ${table} WHERE entity_id=7`).all()).toContainEqual({entity_type:'technical_works'});
      expect(db.prepare('SELECT entity_type FROM funding_relations WHERE entity_id=8').get()).toMatchObject({entity_type:'technical_works'});
      expect(db.prepare("SELECT is_public FROM entry_controls WHERE entity_type='technical_works' AND entity_id=7").get()).toMatchObject({is_public:1});
      expect(db.prepare('SELECT snapshot_json FROM cv_exports').get()).toMatchObject({snapshot_json:'{"entrega":"histórica con ñ"}'});
      expect(db.prepare('SELECT body FROM cv_blocks WHERE id=1').get()).toMatchObject({body:'Texto propio que debe conservarse'});
      expect(db.prepare("SELECT COUNT(*) n FROM cv_block_entries WHERE entity_type='technical_works'").get()).toMatchObject({n:4});
      expect(db.prepare("SELECT project_id FROM technical_works WHERE id=9").get()).toMatchObject({project_id:null});
      expect(db.prepare("SELECT project_id FROM technical_works WHERE id=10").get()).toMatchObject({project_id:3});
      expect(db.prepare('SELECT project_type,programme_code FROM projects WHERE id=3').get()).toMatchObject({project_type:'generation_knowledge',programme_code:'generation_knowledge'});
      expect(()=>db.exec("UPDATE projects SET programme_code='unir_research' WHERE id=3")).toThrow('Generación de Conocimiento');
      expect(()=>db.exec("UPDATE technical_works SET context_name='Duplicado' WHERE id=10")).toThrow('CHECK');
      expect(()=>db.exec('DELETE FROM projects WHERE id=3')).toThrow();
    } finally { db.close(); }
  });
  it('publica el contexto vivo solo cuando el proyecto es público',()=>{
    const db=migratedFixture();
    const sql=publicEntryMetadataSql('e');
    const query=`SELECT e.entity_type,${sql.select} FROM entries e ${sql.joins} WHERE e.entity_type='technical_works' AND e.entity_id=10`;
    try {
      expect(entryMetadataFromRow(db.prepare(query).get()!)).toMatchObject({kind:'professional',context_name:'Proyecto METADRAMA'});
      db.exec("UPDATE entry_controls SET is_public=0 WHERE entity_type='projects' AND entity_id=3");
      expect(entryMetadataFromRow(db.prepare(query).get()!)).toMatchObject({context_name:null,context_programme_es:null});
      db.exec("INSERT INTO technical_works(title,modality) VALUES('Herramienta propia','own_initiative')");
      expect(db.prepare("SELECT project_id,recipient FROM technical_works WHERE title='Herramienta propia'").get()).toMatchObject({project_id:null,recipient:null});
    } finally { db.close(); }
  });
  it('valida el contexto elegido y las categorías académicas específicas',()=>{
    const data=new FormData(); data.set('title','Herramienta');data.set('modality','own_initiative');data.set('context_mode','project');
    let parsed=parseEntityForm(entityForms.technical_works,data);validateEntitySemantics('technical_works',parsed);
    expect(parsed.errors.project_ids).toBeTruthy();
    data.append('project_ids','3');data.append('project_ids','2');data.set('context_name','No duplicar');
    parsed=parseEntityForm(entityForms.technical_works,data);validateEntitySemantics('technical_works',parsed);
    expect(parsed.values.context_name).toBeNull();
    expect(parsed.values.project_ids).toBe('3,2');
    data.set('context_mode','external');parsed=parseEntityForm(entityForms.technical_works,data);validateEntitySemantics('technical_works',parsed);
    expect(parsed.values.project_id).toBeNull();expect(parsed.values.context_name).toBe('No duplicar');
    const project=new FormData();project.set('title','Proyecto');project.set('role','working_team_member');project.set('programme_code','unir_research');
    parsed=parseEntityForm(entityForms.projects,project);validateEntitySemantics('projects',parsed);
    expect(parsed.errors.role).toBeTruthy();
  });
});
