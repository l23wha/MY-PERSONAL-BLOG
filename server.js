
const express=require('express');
 const fs=require('fs');
  const path=require('path');

  const app=express();
   const PORT=3000;


   //Middleware setup
   app.set('view engine','ejs');
    app.use(express.urlencoded({extended:true}));
     app.use(express.static(path.join(__dirname,'public')));

    
     const articlesDir=path.join(__dirname,'data/articles');
     if(!fs.existsSync(articlesDir)){
           fs.mkdirSync(articlesDir,{recursive:true});
     }

     // Guest Section 

     //1. Home Page: List all articles

     app.get('/',(req,res)=>{
         fs.readdir(articlesDir,(err,files)=>{
              if(err){
                  console.error(err);
                   return res.status(500).send("Server error");
              }
              
               const articles=files.map(file=>{
                  const filePath=path.join(articlesDir,file);

                  const content= fs.readFileSync(filePath,'utf-8');
                   return JSON.parse(content);


               });

               //sort according to the date

               articles.sort((a,b)=>new Date(b.date)- new Date(a.date));

                res.render('index',{articles});

         })
     });

     //2. Signle Articles Page

     app.get('/articles/:id',(req,res)=>{
           const filePath=path.join(articlesDir,`${req.params.id}.json`);

             if(!fs.existsSync(filePath)){
                return res.status(404).send("Article not found");
             }

             const article=JSON.parse(fs.readFileSync(filePath,'utf-8'));
             res.render('article',{article});
     });

     //Admin Section 

     // 1 DashBoard: Admint list of articles

     app.get('/admin',(req,res)=>{
          fs.readdir(articlesDir,(err,files)=>{
             if(err){
                  console.error(err);
                   return res.status(500).send('Server error');
             }

             const articles=files.map(file=>{
                  const filePath=path.join(articlesDir,file);
                   return JSON.parse(fs.readFileSync(filePath,'utf-8'));
             });

             res.render('dashboard',{articles});
          })
     });

     //2. Add Article form view

      app.get('/admin/articles/new',(req,res)=>{
          res.render('add-article');
      });

      //3. Handle Add Artiles(Post)

        app.post('/admin/articles',(req,res)=>{
             const {title,content,date}=req.body;
               const id=Date.now().toString();
               const newArticle={id,title,content,date};
               const filePath=path.join(articlesDir,`${id}.json`);

               fs.writeFileSync(filePath,JSON.stringify(newArticle,null,2));
               res.redirect('/admin');
        });

//4. Edit Article form View

app.get('/admin/articles/:id/edit',(req,res)=>{
       const filePath=path.join(articlesDir,`${req.params.id}.json`);

       if(!fs.existsSync(filePath)){
           return res.status(404).send("Article not found");
       }

        const article=JSON.parse(fs.readFileSync(filePath,'utf-8'));

          res.render('edit-article',{article});
});

//5. Handle Edit Article Post
app.post('/admin/articles/:id',(req,res)=>{
      const {title,content,date}=req.body;

      const id=req.params.id;
      const filePath=path.join(articlesDir,`${id}.josn`);

         if(!fs.existsSync(filePath)){
              return res.status(404).send("Article not found");
         }

         const updatedArticle={id,title,content,date};
         fs.writeFileSync(filePath,JSON.stringify(updatedArticle,null,2));
         res.redirect('/admin');
});

//6. Handle Delete Article(POST)

app.post('/admin/articles/:id/delete',(req,res)=>{
     const filePath=path.join(articlesDir,`${req.params.id}.json`);
      
      if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
      }
      res.redirect('/admin');
});

app.listen(PORT,()=>{
      console.log(`Blog Server is running at ${PORT}`);
})

