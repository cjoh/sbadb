
<?php

ini_set('memory_limit','3000M');

$lines = file(getcwd() . '/routes/foia/PRO_ID.TXT');

foreach ($lines as $line_num => $line) {
  echo "Line {$line_num} : " . array_slice(explode("\t", $line), 0, 1) . "\n";
}

echo count($lines) . " parsed\n";

?>