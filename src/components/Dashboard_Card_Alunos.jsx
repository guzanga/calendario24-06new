import Modal from "react-modal";
import { useContext, useEffect, useState } from "react";
import { HiArchiveBoxXMark } from "react-icons/hi2";
import { Dados } from "../contexts/context";
import css from "./Dashboard_Card_Profs.module.css";

Modal.setAppElement("#root");

const emailIsValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const passwordIsSecure = (password) => {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/.test(password);
};

export default function Dashboard_Card_Alunos({ busca }) {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [modalIsOpen2, setIsOpen2] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [email, setEmail] = useState("");
    const [alunosCadastrados, setAlunosCadastrados] = useState([]);
    const { fetchData } = useContext(Dados);
    const [ignore, setIgnore] = useState(0);
    const [cursos, setCursos] = useState([])
    const [idCurso, setIdCurso] = useState(-1)
    const [idUsuario, setIdUsuario] = useState(-1)

    useEffect(() => {
        const handlePegarAluno = async () => {
            let resp = await fetchData("/aluno", "GET");
            setAlunosCadastrados(resp.response);
        };

        handlePegarAluno();
    }, [ignore]);

    const deletarAluno = async (e) => {
        let resp = await fetchData("/usuario/" + e.currentTarget.attributes.getNamedItem("data-id").value, "DELETE");
        console.log(resp);

        if (!("response" in resp)) {
            return window.location.reload();
        }
    };

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    async function openModal2(e) {
        let aluno_id = e.currentTarget.attributes.getNamedItem("data-id").value

        let resp = await fetchData("/cursos_disp", "POST",
            {id_usuario: aluno_id})

        let lista_cursos_disp = resp.response
        console.log(resp)

        if (lista_cursos_disp.length === 0){
            closeModal2()
            alert("Não há cursos disponíveis para o aluno se cadastrar")
            return
        }
        setIdUsuario(aluno_id)
        setCursos(lista_cursos_disp)

        setIsOpen2(true);


    }

    useEffect(() => {
        if (cursos.length > 0) {
            console.log(cursos)
            if (cursos[0].id) {
                setIdCurso(cursos[0].id)
            }
        } else{
            setIdCurso(-1)
        }
    }, [cursos]);

    function closeModal2() {
        setIsOpen2(false);
    }

    const handleCadastrarUser = async (e) => {
        e.preventDefault();

        if (!emailIsValid(email)) {
            alert("Email inválido");
            return;
        }

        if (!passwordIsSecure(senha)) {
            alert("A senha deve ter no mínimo 6 caracteres, uma letra maiúscula, uma letra minúscula e um número.");
            return;
        }

        setNome("");
        setSenha("");
        setEmail("");
        let resp = await fetchData("/usuario", "POST", { nome: nome, senha: senha, email: email, cargo: "aluno"});
        console.log(resp);

        if (!("response" in resp)) {
            return window.location.reload();
        }
        setIgnore(ignore + 1);
        closeModal()
    };

    const  handlePegarCurso = async () => {
        let resp = await fetchData("/matricula", "POST", {id_usuario: idUsuario, id_curso: idCurso})
        console.log(resp)
        closeModal2()
    };

    function handleInputChange(event) {
        setNome(event.target.value);
    }

    function handleInputChange2(event) {
        setEmail(event.target.value);
    }

    function handleInputChange3(event) {
        setSenha(event.target.value);
    }

    function toggleExpansion(index) {
        setExpandedIndex(expandedIndex === index ? null : index);
    }

    return (
        <div>
            <div className={css.card_profs}>
                <h4 className={css.titulo}>Alunos Cadastrados</h4>
                <div className={css.todos_alunos}>
                    {alunosCadastrados
                        .filter((aluno) => aluno?.nome.includes(busca))
                        .map((aluno, index) => (
                            <div className={css.campo2} key={index}>
                                <div className={css.separa_nome}>
                                    <p className={css.professores}>Nome: {aluno.nome}</p>
                                   <button data-id={aluno.id} className={css.btn_lixeira}
                                            onClick={(e) => deletarAluno(e)}>
                                        <HiArchiveBoxXMark className={css.icon_lixeira}/>
                                    </button>
                                </div>

                                {expandedIndex === index && (
                                    <>
                                        <p className={css.professores}>Email: {aluno.email}</p>
                                        <button className={css.btn_matricula} data-id={aluno.id} onClick={(e) => openModal2(e)}>Matricular</button>
                                    </>
                                )}

                                <div className={css.lado}>
                                <button className={css.btn_vermais} onClick={() => toggleExpansion(index)}>
                                        {expandedIndex === index ? "Ver menos" : "Ver mais"}
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
                <button className={css.mais} onClick={openModal}>
                    +
                </button>
            </div>

            <div className={css.plus}>
                <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Example Modal" overlayClassName="modal-overlay">
                    <div className="modal-content">
                        <div>
                            <h2>Cadastrar Novo Aluno</h2>
                        </div>
                        <div className={css.separa_inps}>
                            <input className={css.inp} placeholder={"Nome:"} value={nome} onChange={handleInputChange}/>
                            <input className={css.inp} placeholder={"Email:"} value={email} onChange={handleInputChange2}/>
                            <input className={css.inp} type="password" placeholder={"Senha:"} value={senha} onChange={handleInputChange3}/>
                            <button className={css.cadastrar_btn2} onClick={handleCadastrarUser}>
                                Cadastrar
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={modalIsOpen2}
                    onRequestClose={closeModal2}
                    contentLabel="Example Modal"
                    overlayClassName="modal-overlay"
                >
                    <div className="modal-content1">
                        <div className={css.selects}>
                            <h4>Matricular Aluno</h4>
                            <select className={css.combobox}  onChange={(e) => setIdCurso(e.target.value)}>
                                <option>Selecione:</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={css.btncad}>
                        <button className={css.cadastrar_btn} onClick={(e) => handlePegarCurso(e)}>
                            Matricular
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
