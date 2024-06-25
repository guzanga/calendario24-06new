import css from "./Dashboard_Card_Profs.module.css";
import Modal from "react-modal";
import {useContext, useEffect, useState} from "react";
import { HiArchiveBoxXMark } from "react-icons/hi2";
import {Dados} from "../contexts/context";

Modal.setAppElement("#root");

export default function Dashboard_Card_Cursos({busca}) {
    const [modalIsOpen, setIsOpen] = useState(false);
    const [modalIsOpen2, setIsOpen2] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const [nome, setNome] = useState("")
    const [carga, setCarga] = useState("")
    const [start_curso, setStartCurso] = useState("")
    const [end_curso, setEndCurso] = useState("")
    const [inicio, setInicio] = useState("")
    const [diasDaSemana, setDiasDaSemana] = useState(new Array(7).fill(false))
    const [totalDiasSemana, setTotalDiasSemana] = useState(0)
    const {fetchData} = useContext(Dados)
    const [ignore, setIgnore] = useState(0)
    const [cursosCadastrados, setCursosCadastradas] = useState([]);
    const [professores, setProfessor] = useState([])
    const [salas, setSalas] = useState([])
    const [idSala, setIdSala] = useState(0)
    const [idProfessor, setIdProfessor] = useState(0)


    useEffect(() => {
        const  handlePegarCurso = async (e) => {
            let resp = await fetchData("/curso", "GET")
            console.log(resp)
            setCursosCadastradas(resp.response)
        };

        handlePegarCurso()
    }, [ignore]);

    const  handlePegarProf = async (e) => {
        let resp = await fetchData("/profs_disp", "POST", { "data_de_inicio": inicio, "carga_horaria": carga, "dias_da_semana":totalDiasSemana, "end_curso": end_curso,"start_curso": start_curso })
        let nome = resp.response
        console.log("BUSCA_PROF", resp)
        setProfessor(nome)
    };

    const  handlePegarSala = async (e) => {
        let resp = await fetchData("/salas_disp", "POST", { "data_de_inicio": inicio, "carga_horaria": carga, "dias_da_semana":totalDiasSemana, "end_curso": end_curso,"start_curso": start_curso })
        let nome = resp.response
        console.log(resp)
        setSalas(nome)
    };
    function openModal() {
        setIsOpen(true);
    }


    function closeModal() {
        setIsOpen(false);
        handlePegarProf()
        handlePegarSala()
        openModal2()
    }

    function closeModal3() {
        setIsOpen(false);
    }

    function closeModal4() {
        setIsOpen2(false);
    }



    function openModal2() {
        setIsOpen2(true);
    }
    function closeModal2() {
        setIsOpen2(true);
    }

    function handleInputChange(event) {
        setNome(event.target.value);
    }

    function handleInputChange2(event) {
        setCarga(event.target.value);
    }

    function handleInputChange3(event) {
        const value = event.target.value;

        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (regex.test(value)) {
            setInicio(value);
        } else {
          console.error("Formato inválido para data de início");
        }
    }


    function handleInputChange4(event) {
        const value = event.target.value;

        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (regex.test(value)) {
            setStartCurso(value + ':00');
        } else {
            console.error("Formato inválido para horário de início");
        }
    }

    function handleInputChange6(event) {
        // Obtém o valor do input
        const value = event.target.value;

        // Verifica se o valor corresponde ao formato HH:mm
        const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (regex.test(value)) {
            setEndCurso(value + ':00'); // Adiciona segundos e milissegundos
        } else {
            // Pode implementar um feedback para o usuário aqui, caso o formato não seja válido
            console.error("Formato inválido para horário de término");
        }
    }

    function handleCheckboxChange(position) {
        const update_state = diasDaSemana.map((item, index) =>
            index === position ? !item : item
        )

        setDiasDaSemana(update_state)

        const totalDias = update_state.reduce(
            (sum, is_activated, index) => {
                return sum + is_activated * (2 ** index)
            }, 0
        );

        setTotalDiasSemana(totalDias)
    }

    const deletarCurso = async (e) => {
        let resp = await fetchData("/curso/" + e.currentTarget.attributes.getNamedItem("data-id").value, "DELETE");
        console.log(resp);

        if (!("response" in resp)) {
            return window.location.reload();
        }
    };


    const handleCadastrarCurso = async (e) => {
        e.preventDefault()

        let input_body = {"nome": nome, "data_de_inicio": inicio, "carga_horaria": carga, "dias_da_semana":totalDiasSemana, "end_curso": end_curso,"start_curso": start_curso, "id_professor": idProfessor, "id_sala": idSala}
        console.log(input_body)
        let resp = await fetchData("/curso", "POST", input_body)
        console.log(resp)
        console.log(typeof resp.statusCode)

        setNome('');
        setInicio('');
        setCarga('');
        setTotalDiasSemana(0);
        setDiasDaSemana(new Array(7).fill(false))
        setStartCurso('');
        setEndCurso('');

        if (!("response" in resp)) {
            return window.location.reload();
        }
        closeModal2();
        setIgnore(resp)
    };

    function toggleExpansion(index) {
        setExpandedIndex(expandedIndex === index ? null : index);
    }

    function convertSQLDateToBR(data_de_inicio) {
        if (!data_de_inicio || !/^(\d{4})-(\d{2})-(\d{2})$/.test(data_de_inicio)) {
            return 'Data inválida';
        }
        const [ano, mes, dia] = data_de_inicio.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
        <div>
            <div className={css.card_profs}>
                <h4 className={css.titulo}>Cursos Cadastrados</h4>
                <div className={css.todos_alunos}>
                    {cursosCadastrados
                        .filter((curso) => curso?.nome.includes(busca))
                        .map((curso, index) => (
                        <div className={css.campo2} key={index}>
                            <div className={css.separa_nome}>
                                <p className={css.professores}>Nome: {curso.nome}</p>
                                <button data-id={curso.id}
                                    className={css.btn_lixeira}
                                    onClick={(e) => deletarCurso(e)}
                                >
                                    <HiArchiveBoxXMark className={css.icon_lixeira}/>
                                </button>
                            </div>

                            {expandedIndex === index && (
                                <>
                                    <p className={css.professores}>Carga Horária: {curso.carga_horaria} horas</p>
                                    <p className={css.professores}>Horário de início: {curso.start_curso}</p>
                                    <p className={css.professores}>Horário de término: {curso.end_curso}</p>
                                    <p className={css.professores}>Data de Início: {convertSQLDateToBR(curso.data_de_inicio)}</p>
                                    <p className={css.professores}>Professor: {curso.professor.nome}</p>
                                    <p className={css.professores}>Dias da Semana: {curso.dias_da_semana['list'].join(', ')}</p>
                                </>
                            )}
                            <div className={css.lado}>
                                <button className={css.btn_vermais} onClick={() => toggleExpansion(index)}>
                                    {expandedIndex === index ? 'Ver menos' : 'Ver mais'}
                                </button>
                            </div>


                        </div>
                    ))}
                </div>
                <button className={css.mais} onClick={openModal}>+</button>
                <div className={css.plus}>
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal3}
                        contentLabel="Example Modal"
                        overlayClassName="modal-overlay"
                    >
                        <div className="modal-content">
                            <div>
                                <h2>Cadastrar Novo Curso</h2>
                            </div>
                            <div className={css.separa_inps}>
                                <input
                                    className={css.inp}
                                    placeholder={"Nome:"}
                                    name="nome"
                                    value={nome}
                                    onChange={handleInputChange}
                                    required
                                ></input>
                                <input
                                    className={css.inp}
                                    placeholder={"Carga Horária:"}
                                    name="cargaHoraria"
                                    value={carga}
                                    onChange={handleInputChange2}
                                    required
                                ></input>

                                <input
                                    className={css.inp}
                                    placeholder={"Data de início"}
                                    name="inicio"
                                    type={"date"}
                                    value={inicio}
                                    onChange={handleInputChange3}
                                    required
                                ></input>
                                <div className={css.pzin}>
                                    <p>Início do turno:</p>
                                </div>
                                <input
                                    className={css.inp}
                                    placeholder={"Data de Início:"}
                                    name="start_curso"
                                    value={start_curso}
                                    type={"time"}
                                    onChange={handleInputChange4}
                                    required
                                ></input>
                                <div className={css.pzin}>
                                    <p>Fim do turno:</p>
                                </div>
                                <input
                                    className={css.inp}
                                    placeholder={"Data de Termino:"}
                                    name="end_curso"
                                    value={end_curso}
                                    type={"time"}
                                    onChange={handleInputChange6}
                                    required
                                ></input>
                                <div className={css.pzin2}>
                                    <p>Dias de Aulas:</p>
                                </div>
                                <div style={{display: 'flex'}}>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <input
                                            name={'D'}
                                            type={"checkbox"}
                                            onChange={() => handleCheckboxChange(0)}
                                        />
                                        <label>D</label>
                                    </div>

                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <input
                                            name={'S'}
                                            type={"checkbox"}
                                            onChange={() => handleCheckboxChange(1)}
                                        />
                                        <label>S</label>
                                    </div>

                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <input
                                            name={'T'}
                                            type={"checkbox"}
                                            onChange={() => handleCheckboxChange(2)}
                                        />
                                        <label>T</label>
                                    </div>

                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <input
                                            name={'Q'}
                                            type={"checkbox"}
                                            onChange={() => handleCheckboxChange(3)}
                                        />
                                        <label>Q</label>
                                    </div>

                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <input
                                            name={'Q'}
                                            type={"checkbox"}
                                            onChange={() => handleCheckboxChange(4)}
                                        />
                                        <label>Q</label>
                                    </div>

                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <input
                                            name={'S'}
                                            type={"checkbox"}
                                            onChange={() => handleCheckboxChange(5)}
                                        />
                                        <label>S</label>
                                    </div>

                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <input
                                            name={'S'}
                                            type={"checkbox"}
                                            onChange={() => handleCheckboxChange(6)}
                                        />
                                        <label>S</label>
                                    </div>

                                </div>
                            </div>
                            <div>
                                <button className={css.cadastrar_btn} onClick={closeModal}>
                                    Próxima etapa
                                </button>
                            </div>
                        </div>
                    </Modal>
                    <Modal
                        isOpen={modalIsOpen2}
                        onRequestClose={closeModal4}
                        contentLabel="Example Modal"
                        overlayClassName="modal-overlay"
                    >
                        <div className="modal-content1">
                            <div className={css.selects}>
                                <select className={css.combobox} onClick={(e) => setIdProfessor(e.target.value)}>
                                    {professores.map(professor => (
                                        <option key={professor.id} value={professor.id}>
                                            {professor.nome}
                                        </option>
                                    ))}
                                </select>
                                <select className={css.combobox}  onClick={(e) => setIdSala(e.target.value)}>
                                    {salas.map(sala => (
                                        <option key={sala.id} value={sala.id}>
                                            {sala.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className={css.btncad}>
                            <button className={css.cadastrar_btn} onClick={handleCadastrarCurso}>
                                Cadastrar
                            </button>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

