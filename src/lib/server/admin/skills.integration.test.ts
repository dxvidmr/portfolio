import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {entityForms} from './entity-definitions';
import {parseEntityForm} from './validation';

describe('Modelo de capacidades',()=>{
  it('sustituye el catálogo antiguo sin referencias huérfanas ni equivalencias',()=>{
    const db=new DatabaseSync(':memory:');
    try {
      const current=readFileSync('db/schema.sql','utf8');
      const old=current.substring(0,current.indexOf('CREATE TABLE skill_resources'))
        .replace(/CREATE TABLE skills \([\s\S]*?\);/, 'CREATE TABLE skills(id INTEGER PRIMARY KEY,category TEXT,items_text TEXT,sort_order INTEGER);')
        .replace("SELECT 'skills', id, name_es, NULL FROM skills","SELECT 'skills', id, category, NULL FROM skills")
        .replace(` skill_options TEXT NOT NULL DEFAULT '{"resources":[],"evidence":[]}' CHECK(json_valid(skill_options)),`,'');
      db.exec(old);
      db.exec(`PRAGMA foreign_keys=ON;
        INSERT INTO skills VALUES(1,'Tecnologías web','Svelte',1);
        INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',1,1);
        INSERT INTO cv_profiles(id,name,title) VALUES(1,'CV actual','CV');
        INSERT INTO cv_blocks(id,cv_id,kind,title,sort_order) VALUES(1,1,'entries','Competencias',1);
        INSERT INTO cv_block_entries(block_id,entity_type,entity_id,sort_order) VALUES(1,'skills',1,0);
        INSERT INTO portfolio_items VALUES('todos-a-una','skills',1,0,0);`);
      db.exec(readFileSync('db/migrations/051_capability_based_skills.sql','utf8'));
      expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
      expect(db.prepare('SELECT COUNT(*) AS n FROM skills').get()).toMatchObject({n:12});
      expect(db.prepare('SELECT COUNT(*) AS n FROM cv_block_entries').get()).toMatchObject({n:0});
      expect(db.prepare("SELECT COUNT(*) AS n FROM portfolio_items WHERE entity_type='skills'").get()).toMatchObject({n:0});
      expect(db.prepare('PRAGMA table_info(skills)').all().map(r=>r.name)).not.toContain('items_text');
      expect(db.prepare("SELECT title_cache FROM entries WHERE entity_type='skills' AND entity_id=2").get()).toMatchObject({title_cache:'Codificación textual con XML-TEI'});
      db.exec(readFileSync('db/migrations/052_complete_skill_analysis_evidence.sql','utf8'));
      db.exec(readFileSync('db/migrations/053_refine_capabilities_and_resources.sql','utf8'));
      expect(db.prepare('SELECT COUNT(*) AS n FROM skills').get()).toMatchObject({n:19});
      expect(db.prepare('SELECT name_es FROM skills WHERE id=9').get()).toMatchObject({name_es:'Automatización de flujos de datos y textos'});
      expect(db.prepare('SELECT name_es FROM skills WHERE id=11').get()).toMatchObject({name_es:'Análisis de redes'});
      expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    } finally {db.close();}
  });
  it('analiza selecciones independientes de recursos, méritos y portfolio sin niveles',()=>{
    const f=new FormData();
    f.set('name_es','Modelado de datos');f.set('description_es','Descripción con ñ');f.set('area','skill_data');
    f.append('resource_ids','1');f.append('resource_ids','2');f.append('evidence_ids','4');f.append('portfolio_ids','3');
    const parsed=parseEntityForm(entityForms.skills,f);
    expect(parsed.errors).toEqual({});
    expect(parsed.values).toMatchObject({resource_ids:'1,2',evidence_ids:'4',portfolio_ids:'3',description_es:'Descripción con ñ'});
    expect(entityForms.skills.fields.map(f=>f.name)).not.toContain('level');
  });
});
