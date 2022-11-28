import { Component } from 'react';
import { Constraint } from 'src/models/constraint';
//models / type imports
import { Variables, Point, Optimize } from 'src/models/pl.type';
//components imports
import { ConstraintComponent } from 'src/components/constraint/constraint.component';
import { VariableComponent } from 'src/components/variable/variable.component';
import { GraphComponent } from 'src/components/graph/graph.component';
import { EconomicFunction } from 'src/models/economic_function';
import { ModalComponent } from 'src/components/modal/modal.component';
import './pl.css';
import './w3.css';

type PlPageSate = {
    max: {
        posX: number;
        posY: number;
        negX: number;
        negY: number;
    };
    variables: Variables;
    constraints: Constraint[];
    ecoFunc: EconomicFunction;
    modal: {
        hidden: boolean;
        content: React.ReactNode;
    };
    solutions: {
        hidden: boolean;
        value: Point[];
    };
};

export class PLPage extends Component<any, PlPageSate> {
    public graphRef: any;

    constructor(props: any) {
        super(props);
        this.state = {
            modal: {
                hidden: true,
                content: <span></span>,
            },
            max: {
                posX: 0,
                posY: 0,
                negX: 0,
                negY: 0,
            },
            variables: {
                x: '',
                y: '',
            },
            constraints: [new Constraint(0, '')],
            ecoFunc: new EconomicFunction(Optimize.MAX, ''),
            solutions: {
                hidden: true,
                value: [],
            },
        };

        //ref
        this.graphRef = null;

        //function reference
        this.handleVarChange = this.handleVarChange.bind(this);
        this.removeConstraint = this.removeConstraint.bind(this);
        this.constraintChange = this.constraintChange.bind(this);
        this.setConstraintsState = this.setConstraintsState.bind(this);
        this.addNewConstraint = this.addNewConstraint.bind(this);
        this.setFuncEcoState = this.setFuncEcoState.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.showModal = this.showModal.bind(this);
        this.resolve = this.resolve.bind(this);
        this.setSolutionState = this.setSolutionState.bind(this);
        this.hiddeSolution = this.hiddeSolution.bind(this);
    }

    //logic fonction
    constraintsValidations() {
        let check: boolean = true;
        if (this.state.constraints.length === 0) {
            check = false;
        } else {
            for (let index in this.state.constraints) {
                if (!this.state.constraints[index].isContrainte()) {
                    check = false;
                }
            }
        }
        return check;
    }

    //state function
    closeModal() {
        this.setState((state, _porps) => {
            let tmpModal = state.modal;
            return {
                modal: {
                    ...tmpModal,
                    hidden: true,
                },
            };
        });
    }
    //state function
    showModal(body: React.ReactNode) {
        this.setState((state, _porps) => {
            let tmpModal = state.modal;
            return {
                modal: {
                    content: body,
                    hidden: false,
                },
            };
        });
    }

    handleVarChange(e: any, variable: string) {
        this.hiddeSolution();
        this.setState((state, _props) => {
            let tmpVar = state.variables;
            let newVar = {
                ...tmpVar,
                [variable]: e.target.value,
            };
            Constraint.setVariables(newVar);
            EconomicFunction.setVariables(newVar);
            return {
                variables: newVar,
            };
        });
    }

    setConstraintsState(constraints: Constraint[]) {
        let max = {
            posX: 0,
            posY: 0,
            negX: 0,
            negY: 0,
        };
        let points: Point[] = [];
        constraints.forEach((constraint) => {
            if (constraint.isContrainte()) {
                points = constraint.getXYIntersectionPoints();
                constraints.forEach((c2) => {
                    console.log('intersection f1 : ' + constraint.getFuncString() + 'f2 : ' + c2.getFuncString());
                    console.log('***intersection**', constraint.getIntersectionWith(c2));

                    if (c2.isContrainte() && constraint.getIntersectionWith(c2)) {
                        points.push(constraint.getIntersectionWith(c2) as Point);
                    }
                });
                points.forEach((point) => {
                    if (point.x > max.posX) {
                        max.posX = point.x;
                    }
                    if (point.y > max.posY) {
                        max.posY = point.y;
                    }
                    if (point.x < max.negX) {
                        max.negX = point.x;
                    }
                    if (point.y < max.negY) {
                        max.negY = point.y;
                    }
                });
                if (this.state.ecoFunc.isContrainte()) {
                    let points = this.state.ecoFunc.getGraphPoints(max);
                    points.forEach((point) => {
                        if (point.x > max.posX) {
                            max.posX = point.x;
                        }
                        if (point.y > max.posY) {
                            max.posY = point.y;
                        }
                        if (point.x < max.negX) {
                            max.negX = point.x;
                        }
                        if (point.y < max.negY) {
                            max.negY = point.y;
                        }
                    });
                }
            }
        });
        max.posX += 2;
        max.posY += 2;
        this.setState({
            constraints: constraints,
            max,
        });
    }

    removeConstraint(e: any, id: number) {
        let tmp: Constraint[] = [];
        for (const index in this.state.constraints) {
            if (this.state.constraints[index].getId() !== id && this.state.constraints[index].getId() > id) {
                let constTmp = this.state.constraints[index];
                constTmp.setId(constTmp.getId() - 1);
                tmp.push(constTmp);
            } else if (this.state.constraints[index].getId() !== id) {
                tmp.push(this.state.constraints[index]);
            }
        }
        this.setConstraintsState(tmp);
    }

    constraintChange(e: any, id: number) {
        this.hiddeSolution();
        let tmp: Constraint[] = this.state.constraints.map(
            (constraint): Constraint => {
                if (constraint.getId() === id) {
                    constraint.setFuncString(e.target.value);
                }
                return constraint;
            }
        );
        this.setConstraintsState(tmp);
    }

    addNewConstraint = () => {
        let tmp = this.state.constraints;
        tmp.push(new Constraint(tmp.length, ''));
        this.setConstraintsState(tmp);
    };

    setFuncEcoState(e: any, attr: string) {
        this.hiddeSolution();
        this.setState((state, _props) => {
            let tmpEcoFunc = state.ecoFunc;
            let max = {
                posX: 0,
                posY: 0,
                negX: 0,
                negY: 0,
            };
            max = state.max;
            if (attr === 'optimize') {
                tmpEcoFunc.setOptimize(e.target.value as Optimize);
            } else if (attr === 'func') {
                tmpEcoFunc.setFuncString(e.target.value);
                if (tmpEcoFunc.isContrainte()) {
                    let points = tmpEcoFunc.getGraphPoints(state.max);
                    points.forEach((point) => {
                        if (point.x > max.posX) {
                            max.posX = point.x;
                        }
                        if (point.y > max.posY) {
                            max.posY = point.y;
                        }
                        if (point.x < max.negX) {
                            max.negX = point.x;
                        }
                        if (point.y < max.negY) {
                            max.negY = point.y;
                        }
                    });
                }
            }
            return {
                ecoFunc: tmpEcoFunc,
                max: max,
            };
        });
    }

    hiddeSolution() {
        this.setState((state, _props) => {
            let tmpS = state.solutions;
            return {
                solutions: {
                    value: tmpS.value,
                    hidden: true,
                },
            };
        });
    }

    setSolutionState(solutions: Point[]) {
        this.setState((_state, _props) => {
            console.log('solutions**', solutions);

            return {
                solutions: {
                    value: solutions,
                    hidden: false,
                },
            };
        });
    }

    resolve() {
        this.graphRef.resolve();
    }

    render() {
        return (

            <div className="corps">
            <div className="graphe">
                <ModalComponent onClose={this.closeModal} hidden={this.state.modal.hidden}>
                    {this.state.modal.content}
                </ModalComponent>
                <div className='pl_container'>
                    <div className='pl_forms'>
                        <div className='pl_variables'>
                            <VariableComponent
                                key={'vx'}
                                varString={this.state.variables.x}
                                label={'variable 1'}
                                placeholder={'X'}
                                onChange={(e) => {
                                    this.handleVarChange(e, 'x');
                                }}
                            />
                            <VariableComponent
                                key={'vy'}
                                varString={this.state.variables.y}
                                label={'variable 2'}
                                placeholder={'Y'}
                                onChange={(e) => {
                                    this.handleVarChange(e, 'y');
                                }}
                            />
                        </div>
                        <div className='pl_item'>
                            <div className='constraints_title'>Constrainte</div>
                            {this.state.constraints.map((constraint) =>
                                constraint.isContrainte() ? (
                                    <div key={'c' + constraint.getId().toString()}>
                                        <div className='c_fn_indicator' style={{ background: constraint.getColor() }}></div>
                                        <ConstraintComponent
                                            onClick={this.removeConstraint}
                                            funcString={constraint.getFuncString()}
                                            id={constraint.getId()}
                                            key={'c' + constraint.getId().toString()}
                                            onChange={this.constraintChange}
                                            placeholder={(() => {
                                                return 'Ex : 2' + this.state.variables.x + ' + 4' + this.state.variables.y + ' <= 8';
                                            })()}
                                        />
                                    </div>
                                ) : (
                                    <ConstraintComponent
                                        onClick={this.removeConstraint}
                                        funcString={constraint.getFuncString()}
                                        id={constraint.getId()}
                                        key={'c' + constraint.getId().toString()}
                                        onChange={this.constraintChange}
                                        placeholder={(() => {
                                            return 'Ex : 2' + this.state.variables.x + ' + 4' + this.state.variables.y + ' <= 8';
                                        })()}
                                    />
                                )
                            )}
                            <div onClick={this.addNewConstraint}>
                                <button className='btn'>Ajouter</button>
                            </div>
                        </div>
                        <div className='pl_item'>
                            <div className='ecoFunc_title'>Fonction economique</div>
                            {
                                <div className='ecoFunc_input'>
                                    <select
                                        value={this.state.ecoFunc.getOptimize()}
                                        onChange={(e) => {
                                            this.setFuncEcoState(e, 'optimize');
                                        }}
                                    >
                                        <option value='MAX'>MAX</option>
                                        <option value='MIN'>MIN</option>
                                    </select>
                                    <input
                                        value={this.state.ecoFunc.getFuncString()}
                                        onChange={(e) => {
                                            this.setFuncEcoState(e, 'func');
                                        }}
                                        type='text'
                                        placeholder={(() => {
                                            return '(Z) Ex: 2' + this.state.variables.x + ' + 3' + this.state.variables.y;
                                        })()}
                                    />
                                </div>
                            }
                        </div>
                        <div className='pl_item'>
                            {this.constraintsValidations() && this.state.ecoFunc.isContrainte() && (
                                <button className='btn' onClick={this.resolve}>
                                    Resoudre
                                </button>
                            )}
                        </div>
                        {!this.state.solutions.hidden && (
                            <div className='pl_item'>
                                <div className='pl_subtitle'>Solution</div>
                                <div className='pl_solutions'>
                                    {this.state.solutions.value.map((s, si) => {
                                        return (
                                            <div key={'ss' + si.toString()} className='pl_solution_item'>
                                                <div className='pl_el'>{'S ' + (si + 1).toString() + ' : '}</div>
                                                <div className='pl_points pl_el'>
                                                    <div className='p_label'>X: </div>
                                                    <div className='p_label'>{s.x}</div>
                                                </div>
                                                <div className='pl_points pl_el'>
                                                    <div className='p_label'>y: </div>
                                                    <div className='p_label'>{s.y}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                    <div className="">
                    <div className='graph_container'>
                        {this.constraintsValidations() && (
                            <GraphComponent
                                newSolutions={this.setSolutionState}
                                onAlert={this.showModal}
                                ref={(ref) => (this.graphRef = ref)}
                                ecoFunc={this.state.ecoFunc}
                                key={'gc'}
                                max={this.state.max}
                                constraints={this.state.constraints}
                            />
                        )}
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}
