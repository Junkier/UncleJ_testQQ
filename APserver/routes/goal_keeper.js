var logined_check = function(req){
    return req.session.isLogined == '1' ;
}

var level_check = function(req){
    var result = false;
    if(req.session.userlevel && req.session.userlevel != 'low'){
        result = true;
    } 
    return result;
}

var e_time_check = function(time){
    return (new Date(time) - new Date()) > 0 ;
}

exports.logined_check = logined_check;
exports.level_check = level_check;
exports.e_time_check = e_time_check;