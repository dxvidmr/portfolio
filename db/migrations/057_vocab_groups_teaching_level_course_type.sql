-- Grupos en el vocabulario (término padre opcional), nivel de la docencia y tipo de curso recibido.

-- 1. Término padre opcional: agrupa valores de un dominio (p. ej. roles de asociación en
--    «Miembro» y «Junta directiva») sin perder el detalle de cada rol.
ALTER TABLE type_vocab ADD COLUMN group_code TEXT REFERENCES type_vocab(code);

INSERT OR IGNORE INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES
  ('membership_group_member','membership_role_group','Miembro','Member',10),
  ('membership_group_board','membership_role_group','Junta directiva','Board',20);

UPDATE type_vocab SET group_code = 'membership_group_member' WHERE code = 'membership_member';
UPDATE type_vocab SET group_code = 'membership_group_board'
 WHERE code IN ('membership_board_member','membership_student_board_member');

-- 2. Nivel de la docencia impartida (no es lo mismo grado que máster).
ALTER TABLE teaching ADD COLUMN teaching_level TEXT REFERENCES type_vocab(code);

INSERT OR IGNORE INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES
  ('teaching_level_bachelor','teaching_level','Grado','Bachelor''s degree',10),
  ('teaching_level_master','teaching_level','Máster','Master''s degree',20),
  ('teaching_level_doctoral','teaching_level','Doctorado','Doctoral programme',30),
  ('teaching_level_nonformal','teaching_level','Formación no reglada','Non-degree training',40);

UPDATE teaching SET teaching_level = 'teaching_level_bachelor' WHERE id = 1;

-- 3. Tipo de curso recibido (un taller de horas no es un curso semestral).
ALTER TABLE courses ADD COLUMN course_type TEXT REFERENCES type_vocab(code);

INSERT OR IGNORE INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES
  ('course_type_course','course_type','Curso','Course',10),
  ('course_type_intensive','course_type','Curso intensivo','Intensive course',20),
  ('course_type_summer','course_type','Curso de verano','Summer course',30),
  ('course_type_workshop','course_type','Taller','Workshop',40),
  ('course_type_session','course_type','Sesión formativa','Training session',50),
  ('course_type_institutional','course_type','Formación institucional','Institutional training',60);

UPDATE courses SET course_type = 'course_type_course' WHERE id IN (6, 1);
UPDATE courses SET course_type = 'course_type_intensive' WHERE id IN (5, 4);
UPDATE courses SET course_type = 'course_type_summer' WHERE id = 3;
UPDATE courses SET course_type = 'course_type_workshop' WHERE id IN (8, 9, 12);
UPDATE courses SET course_type = 'course_type_session' WHERE id IN (7, 2, 10);
UPDATE courses SET course_type = 'course_type_institutional' WHERE id = 11;
