const{
    validarEmail
} = require("./../perfil.js");

describe("Teste da função validar email", ()=> {
    test ("Validar email com caracters validos 'silvia@empresa.com' "),() =>{
        expect (validarEmail('silvia@empresa.com')).toBe(true)
    }
});

