#!/bin/sh

# The version of your project to display within the documentation.
v=`/usr/bin/head -1 VERSION.txt`

pname="PUNDIT Project $v"

echo "Use '$0 lint' to double check your comments"

runtype="${1:-build}"
rm -f yuidoc.json
sed "s%{pundit-version}%${pname}%g" yuidoc.json-template > yuidoc.json

[ $runtype == 'build' ] && { 
    echo "Building the docs : \n\n"; 
    yuidoc
}

[ $runtype == 'lint' ] && { 
    echo "Linting your code : \n\n"; 
    yuidoc --lint
    [ $? -eq 0 ] && { echo "No errors found in the comments. Congratulations!"; }
}

rm -f yuidoc.json