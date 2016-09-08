
# coding: utf-8

# In[ ]:



# FPtree by utf-8
# Define FPtree_Association Func.
from collections import Counter
def fp_association(freqitems_set, keyword, rank, confcut) : 

    support_keyword = 0    # 查詢關鍵字的出現頻次 p(A)
    all_freq = 0    # 所有頻繁項目集出現頻次
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

# Get Model
with open("FPtree_model","r") as in_file:
    tree_back = [eval(ele.strip()) for ele in in_file.readlines()]
    
userword = '小米'
rank = 10
confcut = 0.1 
result = []
the_1st_ele = fp_association(tree_back, userword, rank, confcut)
the_1st_words = map(lambda ele_tuple : ele_tuple[0], sorted(the_1st_ele.items() , key = lambda ele : ele[1] , reverse = True))

for word in the_1st_words:
    
    sorted_2nd_result = sorted(fp_association(tree_back , word , 10 ,0 ).items() , key = lambda ele : ele[1] , reverse = True)
    
    for the_2nd_ele in sorted_2nd_result:
        # the_2nd_ele is a tuple.
        if the_2nd_ele[0] not in the_1st_words  and the_2nd_ele[0] not in userword:
            result.append({
                "word" : userword , 
                "weight" : the_2nd_ele[1] , 
                "Level1" : word , 
                "Level2" : the_2nd_ele[0]
            })

if len(result) > 0:            
    for ele in result:
        print ele["word"] , ele["weight"] , ele["Level1"] , ele["Level2"]
else : 
    print "None Association!!"

