---
filename: index
type: toc
---

## Table of Contents

### Interfaces

{% assign interfaces = site.pages | where: "type", "interface" | sort: "title" %}
{% for page in interfaces %}
Page: [{{ page.title }}]({{ page.filename }})

{% endfor %}

### Contracts

{% assign contracts = site.pages | where: 'type', 'contract' | sort: "title"  %}
{% for page in contracts %}
Page: [{{ page.title }}]({{ page.filename }})

{% endfor %}
