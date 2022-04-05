const express = require('express')

const app = express()
const port = 3000

const db = require('./connection/db')

app.set('view engine', 'hbs') // set view engine hbs
app.use('/public', express.static(__dirname + '/public')) // set public path/folder
app.use(express.urlencoded({extended: false}))

let isLogin = true

app.get('/blog', function(req, res){
    res.render('blog')
})

app.get('/contact', function(req, res) {
    res.render('contact')
})


app.get('/', function(req, res) {

    db.connect(function(err, client, done){
        if (err) throw err // untuk menampilkan error koneksi database

        client.query('SELECT * FROM tb_blog', function(err, result) {
            if (err) throw err // untuk menampilkan error query

            let data = result.rows

            data = data.map(function(item){
                return{
                    ...item,
                    isLogin: isLogin,
                    description: item.description.slice(0, 150) + '....',
                    duration: getDate(item.inputstart , item.inputend)
                }
            })

            res.render('index', {isLogin, blogs: data})
        })
    })

})

app.post('/blog', function(req, res){

    let data = req.body
    // console.log(data);

    let node = data.inputNode
    let react = data.inputReact
    let javascript = data.inputJavascript
    let html = data.inputHtml

    let array = [node, react, javascript, html]
    let cek = array.filter (function(item){
        return item !== undefined
        
    }) 

    // console.log(cek);


    db.query(
    "INSERT INTO tb_blog (description, technologies, project, inputstart, inputend) VALUES ($1, $2, $3, $4, $5)",
    [
      data.inputDescription,
      // buat array untuk di masukkan ke db
      cek,
      data.inputProject,
      data.inputStart,
      data.inputEnd
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.redirect("/");
    }
  );


})

app.get('/blog-detail/:id', function(req, res) {
    
    let id = req.params.id

    db.connect(function (err, client, done) {
        if (err) throw err

        client.query(`SELECT * FROM tb_blog WHERE id = ${id}`, function(err, result) {
            if (err) throw err
            done();

            let data = result.rows

            databaru = data.map(function(item){
                return{
                    ...item,
                    duration: getDate(item.inputstart , item.inputend)
                }
            })
            console.log(databaru);

            res.render('blog-detail', {blogs: databaru[0]})
        })
    })
})


app.get('/delete-blog/:id', function(req, res){

    // console.log(req.params.id);
    const id = req.params.id

    const query = `DELETE FROM tb_blog WHERE id=${id};`

    db.connect(function(err, client, done) {
        if (err) throw err

        client.query(query, function(err, result){
            if (err) throw err
            done()

            res.redirect('/') // untuk berpindah halaman
        })
    })
})

app.get ('/update-blog/:id', (req, res) =>{

    let id =  req.params.id
    // console.log(id);
    db.connect((err, client, done) => {
        if (err) throw err

        client.query (`SELECT * FROM tb_blog WHERE id = ${id}`, (err, result) =>{
            if (err) throw err
            done()
            let data = result.rows[0]

            // console.log(data);
            res.render('update-blog', {edit: data, id})
        })
    })
})

app.post('/update-blog/:id', function(req, res){
    let data = req.body
    let id = req.params.id
    let node = data.inputNode
    let react = data.inputReact
    let javascript = data.inputJavascript
    let html = data.inputHtml
    let array = [node, react, javascript, html]
    let cek = array.filter (function(item){
        return item !== undefined
    })
    console.log(id);
    db.connect((err, client, done) => {
        if (err) throw err
        client.query (`UPDATE tb_blog SET project=$1, inputstart=$2, inputend=$3, description=$4, technologies=$5 WHERE id =  ${id};`, 
        [
            data.inputProject,
        // buat array untuk di masukkan ke db
            data.inputStart,
            data.inputEnd,
            data.inputDescription,
            cek,
        ],
        (err, result) =>{
            if (err) throw err
            done()
            res.redirect('/')
        })
    })
})

function getDate(start, end) {

    let inputStart = new Date(start);
    let inputEnd = new Date(end);
    let hasil = inputEnd - inputStart;
    let milisecond = 1000;
    let second = 3600;
    let hours = 24;
    let day = Math.floor(hasil / (milisecond * second * hours));
    let month = Math.floor(day / 30);


    if (day <= 30) {
        return `${day} hari`;
    } else if (day > 30 ) {
        return `${month} bulan`;
    }
}




app.listen(port, function(){
    console.log(`Server listen on port ${port}`);
})