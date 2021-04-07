seed = 123
import collections
import re

# Data manipulation
import pandas as pd
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
# from spellchecker import SpellChecker

from nltk.tokenize import RegexpTokenizer
from nltk import pos_tag
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from gensim.parsing.preprocessing import STOPWORDS
import matplotlib.pyplot as plt
from src.visualization.NetworkPlot import NetworkPlot
import numpy as np

class MyDoc2Vec():

    stop_words = set(STOPWORDS).union(stopwords.words("english"))\
                        .union(['shall', 'cannot', 'could', 'done', 'let', 'may' 'mayn',
                                       'might', 'must', 'need', 'ought', 'oughtn',
                                       'shall', 'would', 'br'])


    model_path = "../../models/doc2vec/d2v.model"
    dataset_path = "../../data/processed/vis_dataset/vis_data.csv"
    num_epoches = 16
    vector_size = 50
    min_count = 5
    workers = 8
    dm = 1

    model = None
    similarity_matrix = None


    @staticmethod
    def convert_to_american(token):
        # Copied from here
        token = re.sub(r"(...)our$", r"\1or", token)
        token = re.sub(r"([bt])re$", r"\1er", token)
        token = re.sub(r"([iy])s(e$|ing|ation)", r"\1z\2", token)
        token = re.sub(r"ogue$", "og", token)
        return token

    @staticmethod
    def correct_typo(tokens):
        spell = SpellChecker()
        return [spell.correction(t) if len(spell.unknown([t])) > 0 else t for t in tokens]


    @staticmethod
    def preprocess_text_2(text):
        """
        Note: This method is not being used
        :param text:
        :return:
        """
        stop_words = MyDoc2Vec.stop_words

        # 1. Tokenise to alphabetic tokens
        tokeniser = RegexpTokenizer(r'[A-Za-z]+')
        tokens = tokeniser.tokenize(text)

        # 2. Lowercase and lemmatise
        lemmatiser = WordNetLemmatizer()
        tokens = [lemmatiser.lemmatize(t.lower(), pos='v') for t in tokens]

        # 3. Correct spelling (this won't convert 100% )
        # tokens = correct_typo(tokens)

        # 4. Convert British spelling to American spelling (this won't convert 100%)
        # tokens = [convert_to_american(t) for t in tokens]

        # 5. Remove stopwords
        tokens = [t for t in tokens if t not in stop_words]
        return tokens


    @staticmethod
    def preprocess_text(text, pos_to_keep=None):
        """
            Preprocess document into normalised tokens.
        """

        stop_words = MyDoc2Vec.stop_words

        # Tokenise into alphabetic tokens with minimum length of 3
        tokeniser = RegexpTokenizer(r'[A-Za-z]{3,}')
        tokens = tokeniser.tokenize(text)

        # Lowercase and tag words with POS tag
        tokens_lower = [token.lower() for token in tokens]
        pos_map = {'J': 'a', 'N': 'n', 'R': 'r', 'V': 'v'}
        pos_tags = pos_tag(tokens_lower)

        # Keep tokens with relevant pos
        if pos_to_keep is not None:
            pos_tags = [token for token in pos_tags if token[1][0] in pos_to_keep]

        # Lemmatise
        lemmatiser = WordNetLemmatizer()
        lemmas = [lemmatiser.lemmatize(t, pos=pos_map.get(p[0], 'v')) for t, p in pos_tags]

        # Remove stopwords
        keywords = [lemma for lemma in lemmas if lemma not in stop_words]
        return keywords

    @staticmethod
    def train_doc2vec_model(check_self_acc = False,save_model = True, re_train=True):
        dataset = pd.read_csv(MyDoc2Vec.dataset_path)


        print("pre-processing data...")
        data = [MyDoc2Vec.preprocess_text(document) for document in dataset.Abstract]
        documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(data)]



        if re_train:
            print("Training...")
            model = Doc2Vec(vector_size=MyDoc2Vec.vector_size, min_count=MyDoc2Vec.min_count, \
                            workers=MyDoc2Vec.workers, epochs=MyDoc2Vec.num_epoches, dm=MyDoc2Vec.dm)
            model.build_vocab(documents=documents)
            model.train(documents, total_examples=model.corpus_count, epochs=model.epochs)

        else:
            model = Doc2Vec.load(MyDoc2Vec.model_path)  #we can continue training with the loaded model
            print("Model is loaded!")

        if check_self_acc:
            ranks = []
            second_ranks = []
            for doc_id in range(len(documents)):
                test_data = documents[doc_id].words

                inferred_vector = model.infer_vector(test_data)
                sims = model.docvecs.most_similar([inferred_vector], topn=len(model.docvecs))
                rank = [docid for docid, sim in sims].index(doc_id)
                ranks.append(rank)

                second_ranks.append(sims[1])

            # Let's count how each document ranks with respect to the training corpus
            # NB. Results vary between runs due to random seeding and very small corpus
            counter = collections.Counter(ranks)
            print("Accuracy ('True' if itself is the 1st rank)", counter[0] / sum(counter.values()))
            print(counter)


        if save_model:
            model.save(MyDoc2Vec.model_path)
            print("Saved model at {}".format(MyDoc2Vec.model_path))

        MyDoc2Vec.model = model
        return None

    @staticmethod
    def output_sentences(most_similar):
        for label, index in [('MOST', 0), ('SECOND-MOST', 1), ('MEDIAN', len(most_similar) // 2),
                             (f'LEAST ({len(most_similar)}th)', len(most_similar) - 1)]:
            print("label=", label)
            print("index=", index)
            print(u'%s %s: %s\n' % (label, most_similar[index][1], " ".join(data[int(most_similar[index][0])])))

    @staticmethod
    def calc_doc2vec_similarity(output_path=None, fill_diagonal=None):
        """
            https://stackoverflow.com/questions/41905029/create-cosine-similarity-matrix-numpy
        """
        model = MyDoc2Vec.model

        embedding_vectors = model.docvecs.vectors_docs
        embedding = embedding_vectors.T

        norm = (embedding * embedding).sum(0, keepdims=True) ** .5
        embedding_norm = embedding / norm
        similarity_matrix = embedding_norm.T @ embedding_norm


        if fill_diagonal:
            np.fill_diagonal(similarity_matrix, fill_diagonal)

        if output_path:
            similarity_df = pd.DataFrame(similarity_matrix, index=list(range(len(similarity_matrix))))
            similarity_df.to_csv(output_path, index=True)
            print("Wrote file!")

        MyDoc2Vec.similarity_matrix = similarity_matrix

        return similarity_matrix


    @staticmethod
    def plot_heatmap(img_path=None):

        arr = MyDoc2Vec.similarity_matrix
        plt.figure(figsize=(15, 10))

        plt.imshow(arr, cmap='viridis')
        plt.colorbar()
        if img_path:
            plt.savefig(img_path)
            print("saved image!")

    @staticmethod
    def run_doc2vec_similarity(similarity_path, fill_diagonal, heatmap_path, check_self_acc, save_model, re_train):
        MyDoc2Vec.train_doc2vec_model(check_self_acc, save_model, re_train)
        MyDoc2Vec.calc_doc2vec_similarity(similarity_path, fill_diagonal)
        MyDoc2Vec.plot_heatmap(heatmap_path)



if __name__ == '__main__':
    print("Running...")

    similarity_path = "../../data/processed/vis_dataset/similarity_doc2vec.csv"
    dataset_path = "../../data/processed/vis_dataset/vis_data.csv"
    output_path = "../../reports/figures/doc2vec_similarity/similarity_Doc2Vec.html"
    heatmap_path = "../../reports/figures/doc2vec_similarity/heatmaps/heatmap_doc2vec.png"

    heading = 'Paper Similarity Using Doc2Vec'

    check_self_acc = False
    save_model = False
    re_train = False
    fill_diagonal = -1
    thres_to_plot = 0.87

    ## Generate doc2vec embedding
    MyDoc2Vec.run_doc2vec_similarity(similarity_path, fill_diagonal, heatmap_path, check_self_acc, save_model, re_train)

    ## Plot network
    network = NetworkPlot(similarity_path, dataset_path, output_path, heading)
    network.plot_network_using_pyvis(thres_to_plot)
    print("=== Done MyDoc2Vec ===!")

