'use strict'
const Student = require('../models/student')
const Matter = require('../models/matter')

function getStudents(req,res) {
    Student.find({},(err,students)=>{
        if (err) return res.status(500).send({ message: `Error al realizar la petision :${err}` })
        if (!students) return res.status(404).send({ message: "No existen estudiantes" })
        res.status(200).send({ students })
    })
    
}
function postStudent(req,res) {
    console.log(req.body)

      let student = new Student({
      studentid:req.body.studentid,
      name:{
          firstname:req.body.firstname,
          lastname:req.body.lastname
      },
      age:req.body.age,
      matter:[]
  })
    student.save((err, studentStored)=>{
        if (err) res.status(500).send({ message: `Error al salvar en la base de datos: ${err}` })

        res.status(200).send({ student: studentStored})
  })
  
    
}
//.update({'alumns.studentid':'14092036'},{$set:{'alumns.$.name.firstname':'mario'}},{multi:true})
function putStudent(req,res) {
    let studentId = req.params.idu
    let matr = req.body.studentid
    let update = {
        studentid:req.body.studentid,
        name:{
            firstname: req.body.firstname,
            lastname:req.body.lastname
        },
        age:req.body.age
    }
    let update2={
        studentid: req.body.studentid,
        name: {
            firstname: req.body.firstname,
            lastname: req.body.lastname
        }
    }
    Student.findByIdAndUpdate(studentId,update,(err,studentUpdate)=>{
        if(err) return res.status(500).send({message:`Error al actualizar al estudiante: ${err}`})
        //res.status(200).send({student:studentUpdate})
    })
    Matter.update({'alumns.studentid':matr},{$set:{'alumns.$':update2}},{multi:true},(err,student)=>{
        if (err) return res.status(500).send({ message: `Error al actualizar al estudiante: ${err}` })
        
        res.status(200).send({student:student})

    })

    
}
function deleteStudent(req,res) {
    let studentId = req.params.idu

    Student.findById(studentId,(err,student)=>{
        if (err) return res.status(500).send({ message: `Error al eliminar el estudiante :${err}` })
        student.remove(err=>{
            if (err) return res.status(500).send({ message: `Error al eliminar el estudiante :${err}` })
            
        })
    })
    Matter.update({ 'alumns._id': studentId }, { $pull: { alumns: { _id: studentId } } }, { multi: true },(err)=>{
        if(err) res.status(500).send({message:`Error al eliminar el estudiente ${err}`})
        res.status(202).send({ message: "estudiante eliminado" })
    })
    
}
function getStudent(req,res) {
    let studentId = req.params.idu
    
    Student.findById(studentId,(err,student)=>{
        if(err) return res.status(500).send({message:`Error al realizar la petision :${err}`})
        if(!student) return res.status(404).send({message:`El estudiante no existe`})
        res.status(200).send({student})
    })

    
}
function delteMatter(req,res) {
    let studentId = req.params.idu
    Student.update({_id:studentId},{$pull:{matter:{_id:req.body.idM}}},(err)=>{
        if (err) return res.status(500).send({ message: `error al eliminar  la materia del alumno ${err}` })
        //if (!student) return res.status(404).send({ message: `El estudienta no existe` })
        
    })
    Matter.update({'_id': req.body.idM }, { $pull: { alumns : {_id:studentId} }}, (err)=>{
        if(err) return re.status(500).send({message:`error al quitar al alumno de la materi ${err}`})

        res.status(200).send({message:`El proceso a terminado`})
    })
    
}

function studentMatter(req, res) {

   
    let studentId = req.params.idu
    let student = {
        _id:studentId,
        studentid:req.body.studentid,
        name:{
            firstname:req.body.firstname,
            lastname:req.body.lastname
        }

    }

    let matterId = req.body.idM
    let matters = { 
        _id:matterId,
        "code":req.body.code,
         "mattername": req.body.mattername,
         "qualification":0}
    console.log("data"+req.body)

    Matter.update({ _id: matterId }, { $push: { alumns: student } }, (err, matter) => {
        if (err) return res.status(500).send({ message: `error al agregar a el alumnos ${err}` })
        if (!matter) return res.status(500).send({ message: `no se encontro la materia` })
        res.status(200).send({ matter: matter })

    })
    Student.update({ _id: studentId},{$push:{matter:matters}},(err,student)=>{
        if(err) return res.status(500).send({message:`error al agregar la materia ${err}`})
        if(!student) return res.status(404).send({message:`El estudienta no existe`})
    })
   

}

//{'matter.code':"info"},{$inc:{"matter.$.qualification":10}}
function addQualification(req, res) {
    let studentId = req.params.idu
    Student.update({ $and: [{ _id: studentId }, { 'matter._id': req.body.code}]}, { $set: {"matter.$.qualification":req.body.cal}},(err,matter)=>{
        if(err) return res.status(500).send({message:`La calificasion no se pudo cambiar ${err}`})
        res.status(200).send({matter})

    })
    
}
function getMatterS(req,res) {
    let studentId = req.params.idu
    let idMatter = req.body.code
    Student.find({$and:[{_id:studentId},{"matter.code":idMatter}]},{"matter.$":1},(err,matter)=>{
        if(err) res.status(500).send({message:`Error al buscar la materia ${err}`})
        if(!matter) res.status(404).send({message:`No se encontro la materia `})
        res.status(200).send({matter})
    })
    
}


module.exports = {
   getStudent,
   postStudent,
   putStudent,
   deleteStudent,
    getStudents,
    studentMatter,
    delteMatter,
    addQualification,
    getMatterS
   
}
