# How to translate ?

The `./messages.yml` file contains most of the expressions (in English and French) embedded in the site interface (outside of the main text) and in the visualizations.

Other elements of the translation are found directly in the `public/data/*.csv` data files.

You can call these expressions in all the application's scripts as in the following example:

```yaml
PecheTypeValue:
  tooltip:
    fr: Valeur de ${value} livres tournois en ${year}
    en: Value of ${value} pounds in ${year}
```

```javascript
function Viz({
    lang // from props
}) {
    const { lang } = useParams(); // from URL
    return <p>{translate('PecheTypeValue', 'tooltip', lang, { year: 1787 })}</p>
}
```