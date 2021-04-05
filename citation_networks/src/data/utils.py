## last update: 2019-05-29

import math

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import plotly.figure_factory as ff
import plotly.graph_objs as go
import plotly.offline as py
import seaborn as sns

# %matplotlib inline
# py.init_notebook_mode(connected=True)

def describe_data(data):
    print(data.describe(percentiles=[0.05 * i for i in range(20)] + [0.99]))
    print("Skewness: %f" % data.skew())
    print("Kurtosis: %f" % data.kurt())
    sns.distplot(data.dropna())


def missing_exploration(data):
    total = data.isnull().sum().sort_values(ascending=False)
    percent = (data.isnull().sum() / data.isnull().count() * 100).sort_values(ascending=False)
    missing_data = pd.concat([total, percent], axis=1, keys=['Total_Missing', 'Percent_Missing'])
    return missing_data


def unique_exploration(df):
    unique_counts = pd.DataFrame.from_records([(col, df[col].nunique()) for col in df.columns],
                                              columns=['Column_Name', 'Num_Unique']).sort_values(by=['Num_Unique'])
    return unique_counts


def map_doi_to_id(doi, doi_to_id_mapping):
    return doi_to_id_mapping.get(doi)

def remove_none_and_dups_in_list(my_list):
    res = list(set([l for l in my_list if l is not None]))
    return res


