# WriTeX

> Create beautiful LaTeX documents with Markdown

WriTeX gives you a workflow for creating print documents (PDF) super-easily; the power of LaTeX with the simplicity of Markdown.

## Setup

Install the WriTeX CLI globally using npm:

```
npm install -g writex
```

WriTeX makes use of [Pandoc](http://johnmacfarlane.net/pandoc/) and LaTeX. [Download and install Pandoc from here.](http://johnmacfarlane.net/pandoc/installing.html). LaTeX comes in different distributions; I recommend [TeX Live](http://www.tug.org/texlive/) for Linux, [MacTeX](https://tug.org/mactex/) for Mac OS X, and [MiKTeX](http://miktex.org/) for Windows.

## Scaffolding a new project

Besides the WriTeX CLI, you will also need a WriTeX template for your document. Templates are installed via npm and you can [find a list of available templates here](https://www.npmjs.com/browse/keyword/writex-template).

> At the time being, project scaffolding is not yet implemented. However, you can manually install the template and copy the config file into the project directory as follows (using the writex-article template as an example):
> 1. Install the template `npm install --save-dev writex-template`
> 2. Copy config file  `cp node_modules/writex-template/writex.yaml ./`

## Writing and Configuring

If your project is set up, you can start writing. All your content belongs in Markdown files with the `.md` suffix. The filenames should be prefixed by a number, so that they are ordered properly (otherwise, WriTeX will not compile them into the `\begin{document} ... \end{document}` area of your LaTeX document):

```
my-project/
- 0-introduction.md
- 1-research.md
- 2-design.md
- 3-implementation.md
- 4-evaluation.md
- 5-conclusion.md
- references.bib
- writex.yaml
```

### Configuration

You can configure some basic parameters of your project in the `writex.yaml` file. Some parameters are necessary for every WriTeX project, some are specific to a certain template. The values under `document` are used by the template to fill certain fields. They depend very much on the used template; an article needs different metadata than, for example, a letter.

An exemplary WriTeX config file:

```yaml
template: article
abstract: false
bibtex: false
engine: xelatex
document:
  author: Arthur Authory
  date: \today
  title: A splendid article
  subtitle: How to write a headline that means absolutely nothing
```

In this example, both `document` and `abstract` are specific to the template ([writex-article](https://github.com/tvooo/writex-article)). All other parameters are universal WriTeX parameters.

### Bibliographies

For the time being, WriTeX supports BibLaTeX bibliographies via `biber`. You can enable them in the config file, setting `bibtex` to `true`. The BibLaTeX file **must** be named `references.bib`. WriTeX will automatically take care of the proper compilation: `latex->biber->latex->latex`.

This is intented to become more flexible in the future, with support for `bibtex` and configurable filenames as well.

### Special content

There are some occasions where your template provides space for special content that does not belong into the regular flow of your document. One such example is an *abstract*, as implemented by the [writex-article](https://github.com/tvooo/writex-article) template.

Special content must not be prefixed by a number, so that it is not included in the `\begin{document} ... \end{document}` area of your LaTeX document.

> **Example:** To enable the use of an *abstract* in the [writex-article](https://github.com/tvooo/writex-article) template, you have to create a file `abstract.md`, fill it with your abstract, and set the `abstract` field in the `writex.yaml` config file to `true`.

For information on the special content that is supported by your template, refer to your template's README.

## Compiling

So you are all set, a first draft is written and you want to see how your PDF looks?

Simply run WriTeX in your project folder:

```
writex
```

It will run through all the steps necessary and spit out your PDF in the end.

### Watch and compile

WriTeX can watch for changes to your Markdown files and compile the new version of your PDF document automatically, which is quite convenient:

```
writex watch
```

## Future plans

I've got quite a bit planned for WriTeX, mostly for my own convenience:

* `writex-acm`, a template for creating ACM research papers
* `writex-book`, a template based on KOMA-Script's `scrbook` document type
* `writex-tvooo-book`, a variation of `writex-book` with custom fonts and a custom title page, glossaries etc.
* `writex-tvooo-article`, a variation of `writex-article` with custom fonts
* Scaffolding of your own WriTeX templates
* Scaffolding of a project using an existing template
* A little website with a nice, illustratory explanation
* Maybe offer the whole process online; on-the-fly PDF generation from pasted Markdown, with your chosen template
