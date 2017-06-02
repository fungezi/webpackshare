let express = require('express');
let path = require('path');
let app = express();
app.use(express.static(path.join(__dirname,'./web')));
app.get('/index',function(req,res){
    res.sendFile(path.join(__dirname , '/web/dist/pages/index.html'));
    
})
app.listen(8080,function(err){
    if(err){
        console.log(err);
    }else{
        console.log('run at localhost:8080');
    }
});