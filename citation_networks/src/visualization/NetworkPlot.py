import numpy as np
import pandas as pd
from pyvis import network as net


class NetworkPlot():

    color_dict = {
        "InfoVis": "orange",
        "VAST": "purple",
        "SciVis": "red"
    }

    def __init__(self, similarity_path, dataset_path, output_path, heading):
        self.similarity_path = similarity_path
        self.dataset_path = dataset_path
        self.output_path = output_path
        self.heading = heading


    @staticmethod
    def get_node_color(node, df, color_dict):
        conference = df[df.id == node].Conference.values[0]
        return color_dict[conference]

    def plot_network_using_pyvis(self, threshold_to_filter_out=None, thres_to_plot=None, plotting_all_nodes=False):
        """
        :param threshold_to_filter_out: the values that are equal or below the threshold will be filtered out.
        :param thres_to_plot:
        :return:
        """
        ## read dataset
        dataset = pd.read_csv(self.dataset_path)

        ## Format when mousing over the node
        id_title_abstract = "<b>Paper id</b>: " + dataset["id"].astype(str) + " ("  + dataset["Conference"] + ") " " - "\
        "<a href=\""  + dataset.Link + "\" target=\"_blank\">Link</a>" + \
        "; <br><b>Title</b>: " + dataset["Title"] + \
        "; <br><b>Abstract</b>: " + dataset["Abstract"]

        map_id_to_label={k: v for  k,v in enumerate(id_title_abstract)}

        ## Read similarity scores
        df = pd.read_csv(self.similarity_path)

        if threshold_to_filter_out is None:
            threshold_to_filter_out = 0.0

        ## get edges (filter out small values, e.g., zeros in case of sparse matrix)
        arr = df.values
        index_names = df.index
        col_names = df.columns
        #  Get indices where such threshold is crossed; avoid diagonal elems
        R,C = np.where(np.triu(arr,1)> threshold_to_filter_out)
        # Arrange those in columns and put out as a dataframe
        out_arr = np.column_stack((index_names[R],col_names[C],arr[R,C]))
        df_out = pd.DataFrame(out_arr,columns=['from','to','weight'])
        df_out["from"] = df_out["from"].astype(np.int16)
        df_out["to"] = df_out["to"].astype(np.int16)


        ## Plot the network
        if thres_to_plot is None:
            df_out_thres = df_out
        else:
            df_out_thres = df_out[df_out.weight >= thres_to_plot]


        file_name = self.output_path
        g = net.Network(height='95%', width='70%', heading=self.heading)

        if plotting_all_nodes:
            node_list = list(df.index.astype(np.int16))
        else:
            node_list = list(set.union(set(df_out_thres["from"]), set(df_out_thres["to"])))

        node_labels = [map_id_to_label.get(node) for node in node_list]
        node_colors = [self.get_node_color(node, dataset, self.color_dict) for node in node_list]

        g.add_nodes(node_list, title=node_labels, label=node_list, color=node_colors)

        edge_list = zip(df_out_thres["from"], df_out_thres["to"], df_out_thres['weight'])
        for e in edge_list:
            g.add_edge(e[0], e[1], value=e[2], title=str(e[2]))  # arrows = 'to')

        g.show_buttons(filter_=["physics"])
        # g.show_buttons()

        g.show(file_name)
        print("Done, wrote file at ", file_name)

    def plot_network_using_jaal(self, threshold_to_filter_out=None, thres_to_plot=None, plotting_all_nodes=False):
        """

        :param threshold_to_filter_out:
        :param thres_to_plot:
        :param plotting_all_nodes:
        :return:
        """





