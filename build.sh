#!/bin/bash

mkdir -p tmp
cp -f template/*.tex tmp/

pandoc --chapters --no-tex-ligatures --normalize write/abstract.md -o tmp/abstract.tex
pandoc --chapters --no-tex-ligatures --normalize write/0-introduction.md -o tmp/0-introduction.tex
pandoc --chapters --no-tex-ligatures --normalize write/1-content.md -o tmp/1-content.tex
pandoc --chapters --no-tex-ligatures --normalize write/2-conclusion.md -o tmp/2-conclusion.tex
#pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Research.md -o research.tex
#pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Exploration.md -o exploration.tex
#pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Concepts.md -o concepts.tex
#pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Ideation.md -o ideation.tex
#pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Design.md -o design.tex
#pandoc --chapters --no-tex-ligatures --normalize ../Conclusion.md -o conclusion.tex
#pandoc --chapters --no-tex-ligatures --normalize ../Postscriptum.md -o postscriptum.tex

cd tmp/
xelatex -shell-escape -interaction nonstopmode paper.tex
#bibtex thesis
#makeglossaries thesis.acn
#makeglossaries thesis.glo
#xelatex -shell-escape -interaction nonstopmode thesis.tex
#xelatex -shell-escape -interaction nonstopmode thesis.tex

cd ..
