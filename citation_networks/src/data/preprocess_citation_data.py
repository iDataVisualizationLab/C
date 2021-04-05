from collections import Counter

import nltk
import os
import string
import numpy as np
import copy
import pandas as pd
import pickle
import re
import math

from pandas_profiling import ProfileReport


import utils

## Config
data_path = "../../data/raw/vis_dataset/IEEE VIS papers 1990-2018.xlsx"
sheet_name = 4

## Read input
dataset = pd.read_excel(data_path, sheet_name=sheet_name)


## remove vis Conference
dataset = dataset[dataset.Conference != "Vis"]

## Drop na, dups
dataset.dropna(subset = ["Abstract"], inplace=True)
dataset.drop_duplicates(["Abstract"], inplace=True)

## reset index
dataset.reset_index(drop=True, inplace=True)

## drop all missing value columns (redundant cols)
dataset.dropna(axis=1, inplace=True, how="all")

## Map doi to id and create a list of ref papers for each id
list_DOI = list(dataset.DOI)
doi_to_id_mapping = {list_DOI[i]:i for i in range(len(list_DOI))}

list_ref = list(dataset.InternalReferences)
mapping= {i: utils.remove_none_in_list(list(map(lambda doi: utils.map_doi_to_id(doi, doi_to_id_mapping), list_ref[i].split(";")))) if list_ref[i] is not np.nan else [] for i in range(len(list_ref))}

dataset["id"] = dataset.DOI.map(doi_to_id_mapping)
dataset["ref_list"] = dataset.id.map(mapping)

## re-order columns
new_col_order = ['Conference', 'Year', 'Title', 'DOI', 'id', "ref_list",'Link', 'FirstPage', 'LastPage',
       'PaperType', 'Abstract', 'AuthorNames-Deduped', 'AuthorNames',
       'AuthorAffiliation', 'InternalReferences', 'AuthorKeywords',
       'AminerCitationCount_02-2020',
       'XploreCitationCount - 2020-01', 'PubsCited', 'Award' ]
dataset = dataset[new_col_order]

## Write file
dataset.to_csv("../../data/processed/vis_dataset/vis_data.csv", index=False)
print("Done!")