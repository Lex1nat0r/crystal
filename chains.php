<?php
// prefix class: storage class for list of prefix words
Interface Prefix {
	  public function init($pref1, $pref2, $pref3); // init has three arguments to support both kinds of prefix
	  public function getID();
}

// random prefix class - two prefixes per suffix
class RPrefix implements Prefix {
	// object's list of words in the prefix
	public $prefList = array();

	// set up the initial prefix list - prefixes are two elements deep
    public function init($pref1, $pref2, $pref3) {
        $this->prefList[0] = $pref1;
	$this->prefList[1] = $pref2;
	}

	// get an ID for this pair of prefixes
	// should be unique
	public function getID() {
	       return $this->prefList[0].':'.$this->prefList[1];
	}	
     
}

// build functoin: build State table from designated file
function build($filename) {
	global $NONWORD;

    // file stuff
    $file = fopen($filename, 'r');
    $text = fread($file, filesize($filename));
    $words = explode(' ', $text);
    fclose($filename);
	
    // words now holds all the words in file, including punctuation

    foreach ($words as $word) {
        add($word);
	}
    add($NONWORD);
	
    return;
}
	
// add function: adds word to suffix list, updates prefix
function add($word) {
	global $statetab;
	global $prefix;

	// find the suffix by indexing the state table with the current prefixes
    $suf = $statetab[$prefix->getID()];
	
	// if the prefixes don't have a suffix
    if(!$suf) {
		// create a new array of suffixes
        $suf = array();
		// and some new prefixes
		   $newPref = new RPrefix();
		   $newPref->prefList = $prefix->prefList;
		// now associate the suffix with the prefixes
        $statetab[$newPref->getID()] = $suf;
	}

	// add to the list of suffixes
    $statetab[$prefix->getID()][] = $word;
	
	// now for some magic: modify the current set of prefixes so that we can add new suffixes
	// shift first element off of prefix -- got to maintain that size of 2
    array_shift($prefix->prefList).' ';
	// add the new word to the end of prefix so we can look for the next suffix AND SO ON
    array_push($prefix->prefList, $word);

    return;
}

// generate function: generate output words
function generate($nwords) {
	global $NONWORD;
	global $statetab;

	$outPUNCH = '';

	// start with random prefix

    $keys = array_keys($statetab);
    $p = $keys[rand(0, count($keys)-1)];
    
    list($pref1, $pref2) = explode(':', $p);
    $pref = new RPrefix();

    $pref->prefList[0] = $pref1;
    $pref->prefList[1] = $pref2;

    for ($i = 0; $i <= $nwords; $i++) {
        $s = $statetab[$pref->getID()];
        $r = rand(0, count($s)-1);
		// get a random suffix for the current prefixes
        $suf = $s[$r];
        if($suf == $NONWORD) {
            return $outPUNCH;
		}
		else {
		     $outPUNCH .= $suf.' ';
		}		
		
		// now shift prefixes
        array_shift($pref->prefList).' ';
        array_push($pref->prefList, $suf);
	}

    return $outPUNCH;
}

// initial variable declarations
$NONWORD = '\n';
$statetab = array();
$prefix = new RPrefix();
$filename = 'chains-ulysses.txt';

$output = 'here we go';

// seed that random
list($usec, $sec) = explode(' ', microtime());
mt_srand((float)$sec + ((float)$usec * 100000));

// set starting prefix
$prefix->init($NONWORD, $NONWORD, $NONWORD);

// here we go:
build($filename);
$word_count = intval(200);
if ($word_count > 1000) {
   $word_count = 1000;
}
$output = generate($word_count);

echo $output;
?>
