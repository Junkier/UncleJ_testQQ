# -*- coding:utf-8 -*-

#### Load function
#######################################################################################################
import math , sys , json

def pmi_docpair(texts, main_guy, enemy , char) :
    word1_cnt = 0
    word2_cnt = 0
    join_cnt = 0
    if main_guy == enemy:
        return 1
    else:
        for text in texts:
            main_group_judge = len(set(main_guy) & set(text))
            enemy_group_judge = len(set(enemy) & set(text))
            if main_group_judge > 0 :
                word1_cnt += 1
            if enemy_group_judge > 0 :
                word2_cnt += 1
            if main_group_judge > 0 and enemy_group_judge > 0 :
                index1 = [text.index(word) for word in main_guy if word in text]    # 列示群1關鍵詞的文章位置
                index2 = [text.index(word) for word in enemy if word in text]    # 列示群2關鍵詞的文章位置
                # 判斷彼此間的位置差距 < 指定的字元距離
                if sum(list(map(lambda z: abs(z) < char , [ x - y for x in index1 for y in index2 ]))) > 0 :
                    join_cnt +=1
        n = float(len(texts))
        if word1_cnt == 0 or word2_cnt == 0 or join_cnt == 0:
            npmi = -1
        else :
            pmi = math.log((join_cnt/n)/((word1_cnt/n)*(word2_cnt/n)),2)
            if join_cnt/n == 1:
                npmi = pmi/(-1*math.log((join_cnt/n+1),2))
            else :
                npmi = pmi/(-1*math.log((join_cnt/n),2))
        corr = (npmi-(-1))/2
        return corr

# 判斷關鍵字群組中有任一出現在文章中
def group_cnt (texts,keywords) :
    word_cnt = 0
    for text in texts:
        if len(set(text) & set(keywords)) > 0:
            word_cnt += 1
    return word_cnt
#######################################################################################################


#### Train model
#######################################################################################################

stdin_data=json.load(sys.stdin)

user_brands = map(lambda name : name.encode("utf-8") ,stdin_data["brands"])
time_keys = [t for t in stdin_data["merged_r_d"].keys()]
# print stdin_data["merged_r_d"]
# print sorted( [t for t in stdin_data["merged_r_d"].keys()] , key = lambda ele : ele , reverse = False)
# time_keys = sorted( [t for t in stdin_data["merged_r_d"].keys()] , key = lambda ele : ele , reverse = False)
# print time_keys
# brands_dict = {
    # "台灣大哥大" : ['台哥大','台灣大哥大','台灣大','台哥','twm'],
    # "中華電信" : ['中華電','中華電信','hinet','種花電信'],
    # "遠傳電信" : ['遠傳電信','遠傳','fetnet','seednet'],
    # "亞太電信" : ['亞太電信','亞太電','亞太','啞太'],
    # "台灣之星" : ['台灣之星','臺灣之星','台星','tstar','Tstar','TSTAR','t-star']
# }
brands_dict = {}
for ele in user_brands:
    brands_dict[ele.split(" ")[0]] = ele.split(" ")


final_data = {}

for timeQQ in time_keys:

    ### Get corpus data
    timeQQ = timeQQ.encode("utf-8")
    final_data[timeQQ] = {}
    corpus = map(lambda ele : ele.encode("utf-8").split("|") , stdin_data["merged_r_d"][timeQQ])

    for main_act in user_brands:
        main_act = main_act.split(" ")[0]
        final_data[timeQQ][main_act] = {}
        for enemy in brands_dict:
            final_data[timeQQ][main_act][enemy] = {
                "correl" : pmi_docpair(corpus, brands_dict[main_act], brands_dict[enemy], 500) ,
                "w_count" : group_cnt(corpus,brands_dict[enemy])
            }


if len(final_data) > 0:
    print json.dumps(final_data)

else :
    print json.dumps({"PMI_Error" : "It's too long~~~~"})
