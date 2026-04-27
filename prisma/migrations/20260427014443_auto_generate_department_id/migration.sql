-- AlterTable
ALTER TABLE "AssetMaintenance" ALTER COLUMN "status_maintain" DROP DEFAULT;

-- AlterTable
CREATE SEQUENCE department_depart_id_seq;
ALTER TABLE "Department" ALTER COLUMN "depart_id" SET DEFAULT nextval('department_depart_id_seq');
ALTER SEQUENCE department_depart_id_seq OWNED BY "Department"."depart_id";
