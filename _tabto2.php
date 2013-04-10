<table><tr><th>gain</th><th>filename</th><tr>

<?php /*  tabto2.php
	take all script files in the folder that contains this file, AND it’s subfolders,
	and convert all tabs at line beginnings to double spaces
	and clean up stray whitespace at line ends  */

$totalGained=0;
opener(__DIR__.'\\');

function opener($folder)  { $types=array('.php', '.js', '.css', '.htm');  global $totalGained ;
	$D=opendir($folder);
	while ($F=readdir($D))  {  if ($F=='.' or $F=='..')  continue;
		if (is_dir($folder.$F))  {opener($folder.$F."\\");  continue;}
		if (!in_array(strrchr($F, '.'), $types))  continue;
		$f1=file_get_contents($folder.$F);  $size=strlen($f1);
		preg_match('/(\r\n|\n|\r)/', $f1, $lb);
		$f1=explode($lb[0], $f1);
		foreach ($f1 as &$l)  {
			$l=preg_replace('/\s+$/', "", $l)
			$l=preg_replace_callback(
				'/^[ \t]+/',
				function($m) {
					for ($i=0; $i<strlen($m[0]); $i++)  {
						if (substr($m[0], $i, 1)==="\t")  {
							if (fmod($i, 2))  $m[0]=substr_replace($m[0], ' ', $i, 1);
							else  $m[0]=substr($m[0], 0, $i).'  '.substr($m[0], ++$i);  }  }
					return $m[0];  },
				$l );  }
		$f1=implode($lb[0], $f1);
		$gained=strlen($f1)-$size;  $totalGained+=$gained;
		if ($gained!=0)  file_put_contents($folder.$F, $f1);
		echo "<tr><td>",$gained,"</td><td>",$folder,$F,"</td></tr>\n";  }
}
echo "</table>\ntotal bytes/characters gained: ",$totalGained;
?>
