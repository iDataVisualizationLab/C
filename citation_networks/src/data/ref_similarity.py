import pandas as pd
from ast import literal_eval
import numpy as np
from scipy.spatial.distance import euclidean, pdist, squareform
from os.path import join as os_join
import seaborn as sns
import matplotlib.pylab as plt


class Ref_Similarity:
    @staticmethod
    def count_overlapping(list_1, list_2):
        return len( set.intersection(set(list_1), set(list_2)) )


    @staticmethod
    def similarity_func(u, v):
        return Ref_Similarity.count_overlapping(u[0],v[0])

    @staticmethod
    def get_similarity_score(id_1, id_2, df_similarity):
        return df_similarity[id_1].loc[id_2]

    @staticmethod
    def create_similarity_df(col, df, out_path = "", write=True, id_col="id"):
        '''
            ex: col= "cited_by_list", df = df
        '''
        df_cited_by_list = df[[ col ]]
        df_cited_by_list.index = df[id_col]

        dists = pdist(df_cited_by_list, Ref_Similarity.similarity_func)
        df_similarity = pd.DataFrame(squareform(dists), columns=df_cited_by_list.index, index=df_cited_by_list.index)
        if write:
            df_similarity.to_csv(os_join(out_path, "similarity_" + col + ".csv"), index=True)
        return df_similarity

    @staticmethod
    def plot_heatmap_sparse_matrix(matrix,  img_path=None):
        matrix = matrix.copy()
        matrix[matrix==0.0]=np.nan
        plt.figure(figsize=(15,10))

        plt.matshow(matrix,aspect='auto',  cmap='viridis', fignum=1)
        plt.colorbar()
        if img_path:
            print("saving the img...")
            plt.savefig(img_path)

        plt.show()




if __name__ == '__main__':

    ## config weights
    cited_by_weight = 1
    cite_to_weight = 1

    out_path = "../../data/processed/vis_dataset/"
    heatmap_output_path = "../../reports/figures/ref_similarity/"
    df = pd.read_csv("../../data/processed/vis_dataset/vis_data.csv")
    print("Reading file...")

    df["cite_to_list"] = df["cite_to_list"].apply(literal_eval)
    df["cited_by_list"] =  df["cited_by_list"].apply(literal_eval)

    df_similarity_cited_by = Ref_Similarity.create_similarity_df(col = "cited_by_list", df=df, out_path=out_path, write=True)
    df_similarity_cite_to = Ref_Similarity.create_similarity_df(col="cite_to_list", df=df, out_path=out_path, write=True)


    df_similarity_combined = df_similarity_cited_by * cited_by_weight + df_similarity_cite_to * cite_to_weight
    df_similarity_combined.to_csv(os_join(out_path, "similarity_combined.csv"), index=True)

    ## Check by plotting heatmaps
    Ref_Similarity.plot_heatmap_sparse_matrix(df_similarity_cited_by.values, os_join(heatmap_output_path, "heatmaps", "heatmap_cited_by.png"))
    Ref_Similarity.plot_heatmap_sparse_matrix(df_similarity_cite_to.values, os_join(heatmap_output_path, "heatmaps",  "heatmap_cite_to.png"))
    Ref_Similarity.plot_heatmap_sparse_matrix(df_similarity_combined.values, os_join(heatmap_output_path,"heatmaps",  "heatmap_combined.png"))

    print("Done!")