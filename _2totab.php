<table><tr><th>reduction</th><th>filename</th><tr>

<?php /*  2totab.php
	take all script files in the folder that contains this file, AND it’s subfolders,
	and convert all double spaces at line beginnings to tabs
	and clean up stray whitespace at line ends  */

$totalSaved=0;
opener(__DIR__.'\\');

function opener($folder)  { $types=array('.php', '.js', '.css', '.htm');  global $totalSaved;
	$D=opendir($folder);
	while ($F=readdir($D))  {  if ($F=='.' or $F=='..')  continue;
		if (is_dir($folder.$F))  {opener($folder.$F."\\");  continue;}
		if (!in_array(strrchr($F, '.'), $types))  continue;
		$f1=file_get_contents($folder.$F);  $size=strlen($f1);
		preg_match('/(\r\n|\n|\r)/', $f1, $lb);
		$f1=explode($lb[0], $f1);
		foreach ($f1 as &$l)  {
			$l=preg_replace(
				'/\s*$/',
				"",
				$l );
			$l=preg_replace_callback(
				'/^[ \t]+/',
				function($m) {return preg_replace(array('/  /', '/ \t/'), "\t", $m[0]);},
				$l );  }
		$f1=implode($lb[0], $f1);
		$saved=$size-strlen($f1);  $totalSaved+=$saved;
		if ($saved!=0)  file_put_contents($folder.$F, $f1);
		echo "<tr><td>",$saved,"</td><td>",$folder,$F,"</td></tr>\n";  }
}
echo "</table>\ntotal saved: ",$totalSaved;
?>
