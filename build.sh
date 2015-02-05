#!/bin/bash

pandoc --chapters --no-tex-ligatures --normalize ../Abstract.md -o abstract.tex
pandoc --chapters --no-tex-ligatures --normalize ../Introduction.md -o intro.tex
pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Research.md -o research.tex
pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Exploration.md -o exploration.tex
pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Concepts.md -o concepts.tex
pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Ideation.md -o ideation.tex
pandoc --chapters --no-tex-ligatures --normalize --biblatex --filter pandoc-citeproc ../Design.md -o design.tex
pandoc --chapters --no-tex-ligatures --normalize ../Conclusion.md -o conclusion.tex
pandoc --chapters --no-tex-ligatures --normalize ../Postscriptum.md -o postscriptum.tex

xelatex -shell-escape -interaction nonstopmode thesis.tex
bibtex thesis
makeglossaries thesis.acn
makeglossaries thesis.glo
xelatex -shell-escape -interaction nonstopmode thesis.tex
xelatex -shell-escape -interaction nonstopmode thesis.tex
