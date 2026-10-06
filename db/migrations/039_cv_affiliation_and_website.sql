-- Keep affiliation and website independently editable; historical exports stay intact.
BEGIN;
ALTER TABLE cv_profiles RENAME COLUMN contact TO affiliation;
ALTER TABLE cv_profiles ADD COLUMN website TEXT NOT NULL DEFAULT '';
-- Split the known combined header without guessing at other free-text values.
UPDATE cv_profiles SET website='https://davidmerinorecalde.com',
  affiliation=substr(affiliation,1,length(affiliation)-length(' · davidmerinorecalde.com'))
  WHERE affiliation LIKE '% · davidmerinorecalde.com';
UPDATE cv_profiles SET website='https://davidmerinorecalde.com',affiliation=''
  WHERE affiliation='davidmerinorecalde.com';
UPDATE cv_profiles SET version=version+1,updated_at=datetime('now');
COMMIT;
