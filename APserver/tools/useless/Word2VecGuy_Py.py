# -*- coding:utf-8 -*-
# We have to set coding type.
# for Linux and Window , maybe it would be different.

# sys.stdin :
# Accept pipe stdout

import sys ,  gensim , logging , json


#//-- window version--//
# userword = sys.argv[1].decode('big5').encode('utf-8')

#//-- linux OS version--//
userword = sys.argv[1]
load_model = gensim.models.Word2Vec.load('./tools/word2vec_model_20160410')
result = []

# word2vec by unicode.
#start = time.time()
try:
    
    for the_1st_word in load_model.most_similar([userword.decode('utf-8')] , topn = 10):
        
        # result.append({
                # "word" : userword,
                # "weight" : the_1st_word[1],
                # "Level1" : the_1st_word[0].encode("utf-8"),
                # "Level2" : ""
            # })
        
        for the_2nd_word in load_model.most_similar(the_1st_word[0] , topn = 10):
            result.append({
                    "word" : userword,
                    "weight" : the_2nd_word[1],
                    "Level1" : the_1st_word[0].encode("utf-8"),
                    "Level2" : the_2nd_word[0].encode("utf-8")
            })
			
	print json.dumps({"word2Vec" : result})

except KeyError as Key_e :
    print json.dumps({"word2VecErr" : str(Key_e)})	
	
#end = time.time()
#diff = end - start


###########   Garbage   ################ 


#data = sys.argv 
#print "Counted" , len(data) , "arguments."
#for i in range(len(data)) :
#	print "No." + str(i+1) + ' argv  :  ' + data[i].decode('big5').encode('utf-8')
	
# not work = =
# data = sys.stdin.readlines()
# print "Counted" , len(data) , "lines."
#for i in range(len(data)) :
#	print "No." + str(i+1) + ' argv  :  ' + data[i]  
#print 'QQ'

