<?php
// history.php
require_once 'db_config.php';
$res = $conn->query("SELECT id, description, created_at FROM runs ORDER BY created_at DESC");
?>
<!doctype html>
<html lang="id">
<head><meta charset="utf-8"/><title>Riwayat Run</title>
<style>body{font-family:Arial; max-width:900px; margin:20px auto;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;} a.btn{background:#2d89ef;color:#fff;padding:6px 10px;border-radius:4px;text-decoration:none;}</style>
</head>
<body>
  <h2>Riwayat Perhitungan (Runs)</h2>
  <p><a href="index.php" class="btn">Buat Run Baru</a></p>
  <table>
    <tr><th>ID</th><th>Deskripsi</th><th>Waktu</th><th>Aksi</th></tr>
    <?php while($r = $res->fetch_assoc()): ?>
      <tr>
        <td><?php echo $r['id']; ?></td>
        <td><?php echo htmlspecialchars($r['description']); ?></td>
        <td><?php echo $r['created_at']; ?></td>
        <td><a href="view_run.php?run_id=<?php echo $r['id']; ?>">Lihat</a></td>
      </tr>
    <?php endwhile;?>
  </table>
</body>
</html>
