const formularioContactos = document.querySelector('#contacto'),
    listadoContactos = document.querySelector('#listado-contactos tbody'),
    inputBuscador = document.querySelector('#buscar');

eventListeners();

function eventListeners() {
    //Cuando el form de crear o editar se ejectua
    formularioContactos.addEventListener('submit', leerFormulario);

    //Borrar contacto
    if (listadoContactos) {
        listadoContactos.addEventListener('click', borrarContacto);
    }

    //Buscadro
    if (inputBuscador) {
        inputBuscador.addEventListener('input', buscarContactos);
    }

    numeroContactos();

}

function leerFormulario(e) {
    e.preventDefault();

    //Leer input

    const nombre = document.querySelector('#nombre').value,
        empresa = document.querySelector('#empresa').value,
        telefono = document.querySelector('#telefono').value,
        accion = document.querySelector('#accion').value;

    if (nombre === '' || empresa === '' || telefono === '') {
        mostrarNoti('Todos los Campos son Obligatorios', 'error');
    } else {
        const infoContacto = new FormData();
        infoContacto.append('nombre', nombre);
        infoContacto.append('empresa', empresa);
        infoContacto.append('telefono', telefono);
        infoContacto.append('accion', accion);


        if (accion === 'crear') {
            insertarBD(infoContacto);
        } else {
            const idRegistro = document.querySelector('#id').value;
            infoContacto.append('id', idRegistro);
            actualizarRegis(infoContacto);
        }
    }
}

//Injeccion de contacto en base de datos
function insertarBD(datos) {
    //Ajax
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'inc/modelos/modelo-contactos.php', true);
    xhr.onload = function () {
        if (this.status === 200) {
            const respuesta = JSON.parse(xhr.responseText);
            const nuevoContacto = document.createElement('tr');
            nuevoContacto.innerHTML = `
            <td>${respuesta.datos.nombre}</td>
            <td>${respuesta.datos.empresa}</td>
            <td>${respuesta.datos.telefono}</td>
            `;

            const contenedorAcciones = document.createElement('td');

            const iconoEditar = document.createElement('id');
            iconoEditar.classList.add('fas', 'fa-pen-square');

            const btnEditar = document.createElement('a');
            btnEditar.appendChild(iconoEditar);
            btnEditar.href = `editar.php?id=${respuesta.datos.id_insertado}`;
            btnEditar.classList.add('btn', 'btn-editar');

            contenedorAcciones.appendChild(btnEditar);

            const iconoBorrar = document.createElement('i');
            iconoBorrar.classList.add('fas', 'fa-trash-alt');

            const btnBorrar = document.createElement('button');
            btnBorrar.appendChild(iconoBorrar);
            btnBorrar.setAttribute('data-id', respuesta.datos.id_insertado);
            btnBorrar.classList.add('btn', 'btn-borrar');

            contenedorAcciones.appendChild(btnBorrar);

            nuevoContacto.appendChild(contenedorAcciones);

            listadoContactos.appendChild(nuevoContacto);

            document.querySelector('form').reset();

            mostrarNoti('Contacto Creado Correctamente', 'exito');

            numeroContactos();
        }
    }
    console.log('dats', datos)
    xhr.send(datos);
}

//Editar Contacto
function actualizarRegis(datos) {
    // console.log(...datos);
    const xhr = new XMLHttpRequest;
    xhr.open('POST', 'inc/modelos/modelo-contactos.php', true);
    xhr.onload = function () {
        if (this.status == 200) {
            const respuesta = JSON.parse(xhr.responseText);

            if (respuesta.respuesta === 'exito') {
                mostrarNoti('Contacto Editado Correctamente', 'exito');
            } else {
                mostrarNoti('Hubo un Error....', 'error');
            }
            setTimeout(() => {
                window.location.href = 'index.php';
            }, 4000);
        }
    };
    xhr.send(datos);
}

//Borrar Contacto
function borrarContacto(e) {
    if (e.target.parentElement.classList.contains('btn-borrar')) {
        const id = e.target.parentElement.getAttribute('data-id');

        const respuesta = confirm('estas seguro (a) ?')

        if (respuesta) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `inc/modelos/modelo-contactos.php?id=${id}&accion=borrar`, true);
            xhr.onload = function () {
                if (this.status === 200) {
                    const resultado = JSON.parse(xhr.responseText);

                    if (resultado.respuesta === 'correcto') {
                        e.target.parentElement.parentElement.parentElement.remove();

                        mostrarNoti('Contacto Eliminado', 'exito')
                        numeroContactos();
                    } else {
                        mostrarNoti('Hubo un Error....', 'error')
                    }

                    setTimeout(() => {
                        window.location.href = 'index.php';
                    }, 4000)
                }
            }
            xhr.send();
        }
    }
}

//Notificacion
function mostrarNoti(mensaje, clase) {
    const notificacion = document.createElement('div');
    notificacion.classList.add(clase, 'notificacion', 'sombra');
    notificacion.textContent = mensaje;

    formularioContactos.insertBefore(notificacion, document.querySelector('form legend'));

    setTimeout(() => {
        notificacion.classList.add('visible');

        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                notificacion.remove();
            }, 500)
        }, 3000)
    }, 100);
}

//Buscador
function buscarContactos(e) {
    const expresion = new RegExp(e.target.value, "i"),
        registros = document.querySelectorAll('tbody tr');

    registros.forEach(registro => {
        registro.style.display = 'none';

        if (registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion) != -1) {
            registro.style.display = 'table-row';
        }
        numeroContactos();
    })

}

//Muestra el numero de contactos
function numeroContactos() {
    const totalContactos = document.querySelectorAll('tbody tr'),
        contenedorNumero = document.querySelector('.total-contactos span');

    let total = 0;

    totalContactos.forEach(contacto => {
        if (contacto.style.display === '' || contacto.style.display === 'table-row') {
            total++;
        }
    })
    contenedorNumero.textContent = total;
}