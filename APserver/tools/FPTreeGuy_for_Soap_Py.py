
# coding: utf-8
# FPtree by utf-8

#### Load function
#######################################################################################################

from tree_builder import Tree_builder
import tree_building , time , sys , json
from tree_miner import Tree_miner
from collections import Counter

def fptree(routines, min_sup, headerTable, freq_items):

    treeBuilder = Tree_builder(routines=routines, min_sup=min_sup, headerTable=headerTable)

    treeMiner = Tree_miner(Tree=treeBuilder.tree, min_sup=min_sup, headerTable=headerTable, freq_items = freq_items)
    freqitems_set = treeMiner.tree_mine
    return freqitems_set

## fp_association : 產出強階層關聯規則

def fp_association(freqitems_set, keyword, rank, confcut) :

    support_keyword = 0
    all_freq = 0
    items = []
    for ele in freqitems_set :
        all_freq += float(ele[-1])
        if keyword in ele :
            support_keyword += float(ele[-1])
            items += [ word for word in ele[0:-1] if word != keyword ]
            items = list(set(items))

    conf = {}


    for item in items :
        support_union = 0    # 公同出現次數 p(A&B)
        support_other = 0    # p(B)
        confidence = 0
        lift = 0
        for ele in freqitems_set :
            if item in ele :
                support_other += float(ele[-1])
                if keyword in ele :
                    support_union += float(ele[-1])
        confidence = support_union/support_keyword    # p(B|A)
        lift = (support_union/support_keyword)/(support_other)*all_freq    # p(B|A)/p(B) > 1 表示正相關
        if lift > 1 and confidence > confcut :
                conf[item] = confidence

    top = dict(Counter(conf).most_common(rank))
    return top
#######################################################################################################

#### Train model
#######################################################################################################
#//-- window version--//
# userword = sys.argv[1].decode('big5').encode('utf-8')

#//-- linux OS version--//
# userword = sys.argv[1]

QQ = json.load(sys.stdin)

# Unicode convert to utf-8
user_contents = map(lambda ele : ele.encode("utf-8") , QQ["fp_raw_data"])
corpus = map(lambda ele : ele.strip().split("|") , user_contents)
user_key_word = map(lambda ele : ele.strip().encode("utf-8") , QQ["keyword"].strip().split(" ") )

# user_key_word = QQ["keyword"].encode("utf-8")

min_sup = 2
headerTable = {}
freq_items = []
tree_model = fptree(corpus, min_sup, headerTable, freq_items)

#######################################################################################################

#### Get words
#######################################################################################################

rank = 10
confcut = 0.05
result = []
judge_list = []
try :
    for word in user_key_word:
        count = 0
        judge_list.append(word)
        the_1st_ele = fp_association(tree_model, word, rank, confcut)
        the_1st_words = sorted(the_1st_ele.items() , key = lambda ele : ele[1] , reverse = True)
        the_1st_word_list = map(lambda ele : ele[0] ,  the_1st_words)


        for the_1st_ele in the_1st_words:

            if len(user_key_word)>1 and count > 3 :
                continue


            if the_1st_ele[0] not in judge_list :
                result.append({
                    "word" : word ,
                    "weight" : the_1st_ele[1],
                    "Level1" : the_1st_ele[0],
                    "Level2" : ""
                })
                judge_list.append(the_1st_ele[0])

                count += 1

            sorted_2nd_result = sorted(fp_association(tree_model , the_1st_ele[0] , 10 ,0 ).items() , key = lambda ele : ele[1] , reverse = True)

            for the_2nd_ele in sorted_2nd_result:

                # the_2nd_ele is a tuple.

                if the_2nd_ele[0] not in the_1st_word_list  and the_2nd_ele[0] not in user_key_word and the_2nd_ele[0] not in judge_list:
                    result.append({
                        "word" : word ,
                        "weight" : the_2nd_ele[1] ,
                        "Level1" : the_1st_ele[0] ,
                        "Level2" : the_2nd_ele[0]
                    })
                    judge_list.append(the_2nd_ele[0])

# the_1st_ele = fp_association(tree_model, user_key_word, rank, confcut)
# the_1st_words = sorted(the_1st_ele.items() , key = lambda ele : ele[1] , reverse = True)
# the_1st_word_list = map(lambda ele : ele[0] ,  the_1st_words)

# for the_1st_ele in the_1st_words:

    # result.append({
		# "word" : user_key_word ,
		# "weight" : the_1st_ele[1],
		# "Level1" : the_1st_ele[0],
		# "Level2" : ""
	# })

    # sorted_2nd_result = sorted(fp_association(tree_model , the_1st_ele[0] , 10 ,0 ).items() , key = lambda ele : ele[1] , reverse = True)

    # for the_2nd_ele in sorted_2nd_result:

        # the_2nd_ele is a tuple.

        # if the_2nd_ele[0] not in the_1st_word_list  and the_2nd_ele[0] not in user_key_word:
            # result.append({
                # "word" : user_key_word ,
                # "weight" : the_2nd_ele[1] ,
                # "Level1" : the_1st_ele[0] ,
                # "Level2" : the_2nd_ele[0]
            # })
except TypeError as e:
        print json.dumps({"FPtreeErr" : "None Association!!"})

if len(result) > 0:
	print json.dumps({"FPtree" : result})
    #for ele in result:
    #    print ele["word"] , ele["weight"] , ele["Level1"] , ele["Level2"]
else :
	print json.dumps({"FPtreeErr" : "None Association!!"})
    # print
