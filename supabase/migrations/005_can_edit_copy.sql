ALTER TABLE tenants ADD COLUMN can_edit_copy bool NOT NULL DEFAULT false;

UPDATE tenants SET can_edit_copy = true WHERE tenant = 'freiburg';
