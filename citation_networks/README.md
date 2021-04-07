Citation Networks
==============================

Citation Networks

--------

**Ver 1.3.** 

## Paper Similarity Using BibliographicCouplings and CoCitations


![image](https://github.com/iDataVisualizationLab/C/blob/master/citation_networks/reports/figures/ref_similarity/networks/Paper%20Similarity%20Using%20BibliographicCouplings%20and%20CoCitations.png)



## Paper Similarity Using Doc2Vec

![image](https://github.com/iDataVisualizationLab/C/blob/master/citation_networks/reports/figures/doc2vec_similarity/networks/Paper%20Similarity%20Using%20Doc2Vec.png)






------------
### Datasets
#### 1. Vis dataset
- Data: [https://docs.google.com/spreadsheets/d/1xgoOPu28dQSSGPIp_HHQs0uvvcyLNdkMF9XtRajhhxU/edit](https://nam04.safelinks.protection.outlook.com/?url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1xgoOPu28dQSSGPIp_HHQs0uvvcyLNdkMF9XtRajhhxU%2Fedit&data=02%7C01%7Cchaupham%40ttu.edu%7Ce19eb53c23ab4d9f373008d8574a4b32%7C178a51bf8b2049ffb65556245d5c173c%7C0%7C0%7C637355323890786919&sdata=rJSn%2FuHYfk%2BjI0g9FcXTDxD0h%2BTZJ8mOEnfYyfiQsv0%3D&reserved=0)
- Data description: [https://sites.google.com/site/vispubdata/data-details](https://nam04.safelinks.protection.outlook.com/?url=https%3A%2F%2Fsites.google.com%2Fsite%2Fvispubdata%2Fdata-details&data=02%7C01%7Cchaupham%40ttu.edu%7Ce19eb53c23ab4d9f373008d8574a4b32%7C178a51bf8b2049ffb65556245d5c173c%7C0%7C0%7C637355323890786919&sdata=oG59IH2HmxsFds%2FY3JYbNW%2F4e2o0a9DlB%2BgNfcwTrqc%3D&reserved=0)

------------
### Project Organization

    ├── LICENSE
    ├── Makefile           <- Makefile with commands like `make data` or `make train`
    ├── README.md          <- The top-level README for developers using this project.
    ├── data
    │   ├── external       <- Data from third party sources.
    │   ├── interim        <- Intermediate data that has been transformed.
    │   ├── processed      <- The final, canonical data sets for modeling.
    │   └── raw            <- The original, immutable data dump.
    │
    ├── docs               <- A default Sphinx project; see sphinx-doc.org for details
    │
    ├── models             <- Trained and serialized models, model predictions, or model summaries
    │
    ├── notebooks          <- Jupyter notebooks. Naming convention is a number (for ordering),
    │                         the creator's initials, and a short `-` delimited description, e.g.
    │                         `1.0-jqp-initial-data-exploration`.
    │
    ├── references         <- Data dictionaries, manuals, and all other explanatory materials.
    │
    ├── reports            <- Generated analysis as HTML, PDF, LaTeX, etc.
    │   └── figures        <- Generated graphics and figures to be used in reporting
    │
    ├── requirements.txt   <- The requirements file for reproducing the analysis environment, e.g.
    │                         generated with `pip freeze > requirements.txt`
    │
    ├── setup.py           <- makes project pip installable (pip install -e .) so src can be imported
    ├── src                <- Source code for use in this project.
    │   ├── __init__.py    <- Makes src a Python module
    │   │
    │   ├── data           <- Scripts to download or generate data
    │   │   └── make_dataset.py
    │   │
    │   ├── features       <- Scripts to turn raw data into features for modeling
    │   │   └── build_features.py
    │   │
    │   ├── models         <- Scripts to train models and then use trained models to make
    │   │   │                 predictions
    │   │   ├── predict_model.py
    │   │   └── train_model.py
    │   │
    │   └── visualization  <- Scripts to create exploratory and results oriented visualizations
    │       └── visualize.py
    │
    └── tox.ini            <- tox file with settings for running tox; see tox.readthedocs.io


--------

<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>
