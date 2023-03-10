#!/usr/bin/env python3
import re
import csv
import json
import requests
import os
import shutil
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qsl

from slugify import slugify
from bs4 import BeautifulSoup
from html_sanitizer import Sanitizer
import validators
from pyzotero import zotero
from citeproc import CitationStylesStyle, CitationStylesBibliography
from citeproc import Citation, CitationItem
from citeproc import formatter
from citeproc.source.json import CiteProcJSON
# from citeproc_styles import get_style_filepath

GDOC_URL = {
    'fr': 'https://docs.google.com/document/d/e/2PACX-1vTAF_yDmEuLh4vQrELpiWWk9HBgvWNM8X-BkHetsVc4eZIBTDIyad7ZW-L8T8mHBlb-I1d3AD2-_eQn/pub',
    'en': 'https://docs.google.com/document/d/e/2PACX-1vQaH-NuArhsmEMCjVNO_-Nh5lKDSEgiRedTheQja-HXTfAoa65R5m2PCgWnYMBgzkrg-ySfACu6YnHo/pub'
}
GSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbB5g5bQMKpqw37PFnPeFMxphRMLDcv0PaLYhlcKtqMlWCIDubTExHOK-ZjbAX34eL9OAfSyqjbXqH/pub?output=csv'


sanitizer = Sanitizer({
    'tags': ('a', 'h1', 'h2', 'h3', 'strong', 'em', 'p', 'ul', 'ol', 'li', 'br', 'hr', 'caller', 'link', 'dfn', 'img'),
    'empty': ('hr', 'caller'),
    'attributes': {
        'caller': ('id', 'class', 'year', 'object'),
        'a': ('href', 'rel', 'target', 'class', 'title'),
        'dfn': ('data-for', 'data-effect', 'data-tip'),
        'h2': ('id'), 
        'h3': ('id'),
        'img':( 'src')
    }
})

def ensure_exists(path):
  if not os.path.exists(path):
    os.makedirs(path)

"""
ensure folders exist
"""
ensure_exists("../src/content")
ensure_exists("../src/content/en")
ensure_exists("../src/content/fr")
"""
copy non-variable mdx files
"""
shutil.copy("../resources/content/footer_fr.mdx", "../src/content/fr/footer.mdx")
shutil.copy("../resources/content/footer_en.mdx", "../src/content/en/footer.mdx")

"""
cols_to_markdown_file = {
    'original_data': 'What is the original data ?',
    'line_correspond_to': 'What does a line correspond to ?',
    'filters': 'Filters',
    'computation_info': 'Aggregation/computation info',
    'warnings': 'Notes/warnings'
}
doc_dir_path = '../doc/'
"""


def set_humain_quote_id(item_metas):
    name = ''
    if 'editor' in item_metas:
        name = item_metas['editor'][0]['family']
    if 'author' in item_metas:
        name = item_metas['author'][0]['family']
    year = item_metas['issued']['date-parts'][0][0]
    year = str(year)
    if name != '' and year != '':
        return name + ',' + year
    else:
        return item_metas['id']


"""
Import visualisations list from GSheet
"""
viz_id_list = {}
inputs_csv_online = {}
bib_source = None
bib_style = CitationStylesStyle('harvard1', validate=False)

with requests.Session() as s:
    print('Get viz list from GSheet')
    download = s.get(GSHEET_URL)
    decoded_content = download.content.decode('utf-8')
    viz_id_list = {}
    reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
    for row in reader:
        if row['statut'] == 'désactivé':
            continue
        del row['statut']
        row['n_chapitre'] = int(row['n_chapitre'])
        # row['inputs'] = [] if row['inputs'] == '' else row['inputs'].split(',')
        # row['outputs'] = [] if row['outputs'] == '' else row['outputs'].split(',')


"""
Import CSV from the web, from viz_id_list
"""
"""
print('Get online CSV list')
for output in inputs_csv_online.keys():
    output_extension = Path(output).suffix
    input_url = inputs_csv_online[output]['input_str']
    id = inputs_csv_online[output]['id']
    print('--', output)
    path = '../public/data/'
    with requests.Session() as s:
        online_csv = s.get(input_url)
        if output_extension == 'csv' and online_csv.headers['Content-Type'] != 'text/csv':
            print('\033[91m','ERROR', '\033[0m', 'is not a csv file')
            continue
        decoded_content = online_csv.content.decode('utf-8')
        f = open(path + output, "w")
        f.write(decoded_content)
        f.close()
        # Duplicate CSV in doc
        f = open(doc_dir_path + '/' + id + '/' + output.replace("/", "_"), "w")
        f.write(decoded_content)
        f.close()
"""

"""
Import CSL JSON from Zotero
"""
"""
print('Get online CSL JSON from Zotero')
zotero_access = zotero.Zotero('4690289', 'group')
# print('--', zotero_access.count_items())
bib_database = zotero_access.items(format='csljson')
bib_database = bib_database['items']
for i, item_metas in enumerate(bib_database):
    bib_database[i]['id'] = set_humain_quote_id(item_metas)
    print('--', bib_database[i]['id'])
json_bib = json.dumps(bib_database, indent=4, ensure_ascii=False)
f = open('../src/data/bib.json', "w")
f.write(json_bib)
f.close()
bib_source = CiteProcJSON(bib_database)
bib_engine = CitationStylesBibliography(bib_style, bib_source, formatter.html)
"""

"""
Import page content from GDoc
"""

first_pass = True
summary = []

site_metadata = {}
for lang in GDOC_URL.keys():
    print('Get online HTML content from GDoc in lang ' + lang)
    
    url = GDOC_URL[lang]
    print(url)
    parts_soup = []

    with requests.Session() as s:
        download = s.get(url)
        decoded_content = download.content.decode('utf-8')
        soup = BeautifulSoup(decoded_content, 'html.parser')
        title = soup.title.get_text()
        print('title : ', title)

        # parse and extract images
        for image_index, image in enumerate(soup.find_all('img')):
          next_block = image.find_all_next()[0]
          next_block_text = next_block.get_text()
          image_title = "image " + str(image_index)
          if "titre : " in next_block_text.lower():
            image_title = next_block_text.split(':')[1].strip()
            # delete legend container
            next_block.decompose()
          image_slug = slugify(image_title)
          # replace image with caller
          caller = soup.new_tag('p')
          # download image locally
          image_src = image['src']
          image_dest = "../public/assets/drafts/" + image_slug + ".jpg"
          img_data = requests.get(image_src).content
          with open(image_dest, 'wb') as handler:
              handler.write(img_data)

          caller.string = '<Caller id=”' + image_slug + "” />"
          image.replace_with(caller)
          # add to viz id list
          viz_id_list[image_slug] = {
            "id": image_slug,	
            # "n_chapitre": 0,
            "statut": "croquis",
            "lien_permanent_visualisation": "",
            "titre_fr": image_title,
            "titre_en": image_title,
            "description_fr": "",
            "description_en": "",
            "comment_lire_fr": "",
            "comment_lire_en": "",
            "comment_cest_fait_fr": "",
            "comment_cest_fait_en": "",
            "original_data": "",
            "line_correspond_to": "",
            "filters": "",
            "computation_info": "",
            "warnings": "",
            "cacher_atlas": ""
          }

        # Ignore and delete useless content
        soup = soup.find(id='contents')
        for styleTag in soup.select('style'):
            styleTag.extract()

        
        doc_title = soup.find_all("p", {"class": "title"})
        doc_title = doc_title[0].get_text() if len(doc_title) > 0 else "No title"
        site_metadata[lang] = {
          "title": doc_title
        }

        titles_per_part = {}
        title_part_number = -1  # because the first title have to be 0
        for title in soup.find_all({'h1', 'h2', 'h3'}):
            title_id = title['id']
            if title.name == 'h1':
                title_part_number += 1
            titles_per_part[title_id] = {
                'part': title_part_number,
                'name': title.name,
                # 'text': title.get_text()
            }

        for link in soup.find_all('a'):
            if link.has_attr('href') == False:
                continue

            re_match_footnote_anchor = re.match(
                r"#ftnt(?P<id>[0-9]+)", link['href'])
            re_match_footnote_ref = re.match(
                r"#ftnt_ref(?P<id>[0-9]+)", link['href'])
            if re_match_footnote_ref:
                footnote_id = re_match_footnote_ref.groupdict()['id']
                footnote_ref = link
                footnote_text_container = footnote_ref.find_next('span')
                footnote_text = ''.join(
                    [text.string for text in footnote_text_container.parent.find_all('span')])
                footnote_text = footnote_text.replace(
                    '“', '«').replace('”', '»')
                footnote_anchor = soup.find(
                    'a', {'href': str('#ftnt' + footnote_id)})
                footnote_anchor_context = footnote_anchor.parent.find_previous().string
                # footnote_anchor_text = footnote_anchor_context.split()[-1]
                footnote_anchor.string.replace_with('?')
                footnote_anchor.name = 'dfn'
                del footnote_anchor['id']
                del footnote_anchor['href']
                footnote_anchor['data-for'] = 'contents-tooltip'
                footnote_anchor['data-effect'] = 'solid'
                footnote_anchor['data-tip'] = footnote_text
                # delete tags
                footnote_ref.extract()
                footnote_text_container.extract()
                continue
            if re_match_footnote_anchor:
                continue

            re_match_title_link = re.match(r"#h(?P<id>.*)", link['href'])
            if re_match_title_link:
                title_id = 'h' + re_match_title_link.groupdict()['id']
                title_name = titles_per_part[title_id]['name']
                title_part = str(titles_per_part[title_id]['part'])
                title_element = soup.find(title_name, {'id': title_id})
                href = '/' + lang + '/partie-' + title_part
                if title_element.name != 'h1':
                    href += '#' + title_id
                link['class'] = 'title_link'
                link['href'] = href
                continue

            # Track Google links to clean them
            link['href'] = re.search(
                r"(?<=q=)(.*?)(?=&)", link['href']).group(1) if re.search(
                r"(?<=q=)(.*?)(?=&)", link['href']) is not None else link["href"]

            parse = urlsplit(link['href'])
            if parse.netloc == 'caller':
                query = unquote(parse.query)
                query = dict(parse_qsl(query))
                link.name = 'caller'
                for key in query.keys():
                    link[key] = query[key]

            # Add attributes for safe navigation
            """
            link['target'] = '_blank'
            link['rel'] = 'noopener noreferrer'
            """

        content = str(soup)
        # Remove useless tags and attributes
        content = sanitizer.sanitize(content)
        # Unescape caller tags and their quotes
        content = re.sub(r"&lt;(.*?)&gt;", r"<\1>",
                         content).replace('”', '"').replace('“', '"')

        # Second edition of HTML
        soup = BeautifulSoup(content, 'html.parser')

        # Each <caller> tag without id is follow by a <div>
        for caller in soup.find_all('caller'):
            """
            if caller.has_attr('id') == False:
                new_tag = BeautifulSoup('<div class="centered-part"></div>', 'html.parser')
                new_tag = new_tag.div
                caller.insert_after(new_tag)
                # Store each element is not a <h1> or another <caller> in the <div>
                for next_tag in new_tag.find_all_next():
                    if next_tag.name not in {'h1', 'caller'}:
                        new_tag.append(next_tag)
                    else:
                        break
                continue
            """
            is_inline_caller = len(caller.parent.find_all()) == 1
            if is_inline_caller == False:
                caller['class'] = 'is-inblock'
            """
            else:
                # <caller> tag is extracted from its <p> parent
                caller.parent.insert_after(caller)
                caller.parent.extract() # Delete <p>
            """

        # loop through each part which are not commented
        for i, title in enumerate([el for el in soup.find_all('h1') if "$" not in el.get_text()]):
            title_text = title.get_text()
            # use convention to choose if a part should go to secondary group
            navgroup = "primary" if not "|" in title_text else "secondary"
            title_text = title_text.replace('|', '')
            title_text = title_text.strip()
            slug = slugify(title_text)
            # @todo refine this, it tackles case where english has more parts than french
            if not first_pass and i + 1 > len(summary):
              continue
            # create a object to be used to build summary.js
            if first_pass:
              group = {
                "routes": {
                  "fr": "partie-" + str(i),
                  "en": "part-" + str(i)
                },
                "titles": {
                },
                "slugs": {
                },
                "navGroup": navgroup
              }
              summary.append(group)
            # update titles for the perspective of building summary.js
            summary[i]["titles"][lang] = title_text
            summary[i]["slugs"][lang] = slug
            part_soup = BeautifulSoup(
                '<div id="part-' + str(i) + '"/>', 'html.parser')
            part_root = part_soup.div
            for next_tag in title.find_all_next():
                if next_tag.name == 'h1':
                    break
                if next_tag.name not in {'p', 'ul', 'ol', 'h1', 'h2', 'h3'}:
                    continue
                part_root.append(next_tag)
            parts_soup.append(part_soup)

        for part_nb, part_soup in enumerate(parts_soup):
            bibliography_spans = {}
            citations_spans = {}
            for title_link in part_soup.find_all('a', {'class': 'title_link'}):
                title_link.name = 'link'
                title_link['to'] = title_link['href']
                del title_link['href']
            for caller in part_soup.find_all('caller'):
                part_viz_id_list = [viz_id for viz_id in viz_id_list.keys(
                ) if 'n_chapitre' not in viz_id_list[viz_id] or (viz_id_list[viz_id]['n_chapitre'] == part_nb)
                ]
                if caller.has_attr('id') == False:
                    caller['class'] = 'is-blank'
                    continue
                caller['id'] = caller['id'].strip()
                if caller['id'] not in part_viz_id_list:
                    # <Caller> id is not find from viz id list
                    caller['class'] = 'is-invalid'
                # attribute n_chapitre to data if none
                elif "n_chapitre" not in viz_id_list[caller['id']]:
                  viz_id_list[caller['id']]["n_chapitre"] = part_nb
            part = str(part_soup)
            # Quoting
            matches = re.finditer(r"\[@.*?\]", part, re.MULTILINE)
            for i, match in enumerate(matches):
                match = match.group()
                match_split = match.split(';')
                citation_group = [re.sub(r"[@\s\[\]]", '', match)
                                  for match in match_split]
                citation_group = [CitationItem(
                    citation) for citation in citation_group if citation]
                citations_spans[match] = citation_group
            # for citation_match in citations_spans.keys():
            #     citation_group = Citation(citations_spans[citation_match])
            #     bib_engine.register(citation_group)
            #     citations_spans[citation_match] = bib_engine.cite(citation_group, warn)
            #     part = part.replace(citation_match, citations_spans[citation_match])
            # Add bibliography for the part
            # for item in bib_engine.bibliography():
            #     bibliography_item_key = item.split(',', 1)[0]
            #     bibliography_span = BeautifulSoup('<li>' + str(item) + '</li>', 'html.parser')
            #     bibliography_spans[bibliography_item_key] = bibliography_span
            # bibliography_spans_sorted = {k: bibliography_spans[k] for k in sorted(bibliography_spans)}
            part_soup = BeautifulSoup(part, 'html.parser')
            # adding the bibliography
            # TODO this is commented for now because it added the same bibliography to all sections.
            # It should be fixed and uncommented at some point
            """
            bib_container_soup = BeautifulSoup('<div class="bibliography"><h2>Bibliographie</h2></div>', 'html.parser')
            for bib_soup in bibliography_spans_sorted.values():
                bib_container_soup.div.append(bib_soup)
            part_soup.div.append(bib_container_soup)
            """
            part = str(part_soup)

            # React requirements
            part = re.sub(r"(</?)caller", r"\1Caller",
                          part)  # caller -> Caller
            part = re.sub(r"(</?)link", r"\1Link", part)  # link -> Laller
            part = re.sub(r"class(=\")", r"className\1",
                          part)  # class -> className

            f = open('../src/content/' + lang +
                     '/part-' + str(part_nb) + '.mdx', "w")
            f.write(part)
            f.close()
            print('-- part', lang, part_nb)
    if first_pass == True:
      first_pass = False

# output metadata
metadata_f = open('../src/content/metadata.json', "w")
metadata_f.write(json.dumps(site_metadata, ensure_ascii=False))
metadata_f.close()

# output summary file
summary_js = """
/* eslint import/no-webpack-loader-syntax : 0 */
import ScrollyPage from '../components/ScrollyPage';
import PlainPage from '../components/PlainPage';

"""
for i, item in enumerate(summary):
  if i == 0:
    continue
  for lang in GDOC_URL.keys():
    summary_js += "\n" + "import " + lang + "Part" + str(i) + " from './" + lang + "/part-" + str(i) + ".mdx';"
  summary_js += "\n"

summary_js += "\nexport default [\n"

for i, item in enumerate(summary):
  if i == 0:
    continue
  base_str = json.dumps(item, indent = 2, ensure_ascii=False)[:-2]
  base_str += ",\n";
  component = "ScrollyPage" if '"navGroup": "primary"' in base_str else "PlainPage"
  base_str += "  Component: " + component + ",\n";
  base_str += "  contents: {" + "\n"
  for lang in GDOC_URL.keys():
    base_str += "    " + lang + ": " + lang + "Part" + str(i) + "," + "\n"
  base_str += "  },\n"
  base_str += "},\n"
  summary_js += base_str

summary_js += "];"
metadata_f = open('../src/content/summary.js', "w")
metadata_f.write(summary_js)
metadata_f.close()


# print viz id list
json_object = json.dumps(viz_id_list, indent=4, ensure_ascii=False)
with open('../src/content/viz.json', "w") as f:
    f.write(json_object)