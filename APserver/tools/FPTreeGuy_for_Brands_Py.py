# -*- coding:utf-8 -*-


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
user_contents = map(lambda ele : ele.encode("utf-8") , QQ["mergedQQ"])
user_chosen_brands_utf8 = QQ["brand"].encode("utf-8")

corpus = map(lambda ele : ele.strip().split("|") , user_contents)

min_sup = 2
headerTable = {}
freq_items = []
tree_model = fptree(corpus, min_sup, headerTable, freq_items)


#######################################################################################################

#### Get words
#######################################################################################################

rank = 10
confcut = 0.05

result = {}
# user_chosen_brands_utf8='台灣大哥大 台灣大 台哥大 台哥'
user_brands_list = [ele for ele in user_chosen_brands_utf8.split(" ")]
result[user_chosen_brands_utf8] = []

# filter the same word & choose cut_count number
judge_list = []
# user_brands_len = len(user_brands_list)

cut_count = 10 if len(user_brands_list) <= 3 else 5

# 1st-stage
for brand_sym_word in user_brands_list:
    w_count = 0
    judge_list.append(brand_sym_word)
    the_1st_ele = sorted(fp_association(tree_model , brand_sym_word , rank,confcut ).items() , key = lambda ele : ele[1] , reverse = True)
    for word in the_1st_ele:
        if w_count >= cut_count:
            break

        if word[0] not in judge_list :
            result[user_chosen_brands_utf8].append({
                "weight" : word[1] ,
                "word" : word[0]
            })
            judge_list.append(word[0])
            w_count += 1

if len(result) > 0:
    print json.dumps(result)
else :
    print json.dumps({"FPtreeErr" : "None Association!!"})
