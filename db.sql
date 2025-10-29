-- db.sql
CREATE DATABASE IF NOT EXISTS ahp_from_sheet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE ahp_from_sheet;

-- Runs (setiap kali user menjalankan perhitungan)
CREATE TABLE IF NOT EXISTS runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criteria
CREATE TABLE IF NOT EXISTS criteria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id INT,
  idx INT,
  name VARCHAR(255),
  weight DOUBLE,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
);

-- Alternatives
CREATE TABLE IF NOT EXISTS alternatives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id INT,
  idx INT,
  name VARCHAR(255),
  final_score DOUBLE,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
);

-- Pairwise for criteria (store upper or both, we'll store full matrix entries posted)
CREATE TABLE IF NOT EXISTS crit_pairwise (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id INT,
  i_idx INT,
  j_idx INT,
  value DOUBLE,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
);

-- Pairwise for alternatives per criterion
CREATE TABLE IF NOT EXISTS alt_pairwise (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id INT,
  crit_idx INT,
  i_idx INT,
  j_idx INT,
  value DOUBLE,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
);

-- Optional: results (cache)
CREATE TABLE IF NOT EXISTS run_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id INT,
  alt_idx INT,
  alt_name VARCHAR(255),
  score DOUBLE,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
);

-- Seed: criteria (from Excel)
-- idx: 1..5
INSERT INTO criteria (run_id, idx, name, weight) VALUES
 (0,1,'Performa CPU & GPU',0),
 (0,2,'RAM & Penyimpanan',0),
 (0,3,'Daya tahan baterai',0),
 (0,4,'Portabilitas (berat/ukuran)',0),
 (0,5,'Harga',0);

-- Seed: alternatives (names from Excel)
INSERT INTO alternatives (run_id, idx, name, final_score) VALUES
 (0,1,'Lenovo IdeaPad Slim 3',0),
 (0,2,'MSI Modern 14 C12MO',0),
 (0,3,'Acer Aspire 5 Slim',0),
 (0,4,'ASUS VivoBook Go 14',0),
 (0,5,'Acer Nitro V 15',0);
