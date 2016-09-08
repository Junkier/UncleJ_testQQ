
# coding: utf-8

# In[ ]:

######### tree_building.py

#coding=utf-8

class Node(object):
    """Node类. 作用:开辟一个树节点"""
    def __init__(self, data=-1, count=0, parent=None):
        """Node类的初始化, 一个节点信息包括:项的值,计数,父亲节点,所有孩子节点"""
        self.data = data
        self.count = count
        self.parent = parent
        self.children = {}


class Tree(object):
    """tree_growth类. 作用:建造树"""
    def __init__(self, data=-1, parent=None, itemTable=None):
        """tree_growth类的初始化,开辟一个树根"""
        self.root = Node(data='null', parent=self)
        self.itemTable = itemTable


    def addRoutine(self, routine, Rroot, count):
        """功能:根据事务routine递归构造树, Rroot是树的根节点, count是routine出现的次数(构造条件FP_tree的时候游泳)"""
        if len(routine) <= 0:       #如果事务为空，则终止
            return
        elem = routine.pop(0)
        #print ('routine',routine)
        #print ('elem.pop',elem)
        if elem in Rroot.children:          #如果事务中的元素在树的已有路径上
            nextNode = Rroot.children[elem]          #如果事务中的元素在树的已有路径上 ，则不用新建路径 
        else:                                       #否则，新建一条路径
            newNode = Node(data=elem, parent=Rroot)         #新建一个节点
            Rroot.children.setdefault(elem,newNode)         #新节点的路径放在当前节点的孩子列表中
            nextNode = newNode
        nextNode.count += count         #更新路径上节点的计数，即加上当前节点的计数
        #print ('nextNode.count',nextNode.count)
        if nextNode not in self.itemTable[elem]:        #如果下一个节点是新建的，则把它压入头结点表中
            #print ('nextNode',nextNode)
            self.itemTable[elem].append(nextNode)
        self.addRoutine(routine=routine, Rroot=nextNode, count=count)           #递归构造树
        return 

