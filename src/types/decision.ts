export type ArgumentSide =
  | 'pro'
  | 'con';

export type DecisionFormat =
  | 'evaluate'
  | 'compare';

export type DecisionOptionKey =
  | 'optionA'
  | 'optionB';


export type ArgumentWeight =
  | 1
  | 2
  | 3
  | 4
  | 5;


export type Argument = {
  id: string;
  optionKey?: DecisionOptionKey;
  side: ArgumentSide;
  text: string;
  weight?: ArgumentWeight;
};



export type DecisionStatus =
  | 'draft'
  | 'reflecting'
  | 'acted'
  | 'tracking'
  | 'completed'
  | 'cancelled'
  | 'archived';



export type ActiveDecisionStatus =
  Exclude<DecisionStatus, 'archived'>;



export type DecisionSatisfaction =
  | 1
  | 2
  | 3
  | 4
  | 5;



/**
 * Deux options comparées dans une décision
 */
export type DecisionOptions = {
  optionA: string;
  optionB: string;
};



export type Decision = {

  id: string;

  /**
   * Manière dont cette décision doit être comprise par tout le parcours.
   */
  format: DecisionFormat;


  /**
   * Sujet principal de la décision
   */
  title: string;



  /**
   * Arguments favorables
   */
  pros: Argument[];



  /**
   * Arguments défavorables
   */
  cons: Argument[];



  /**
   * Comparaison de deux choix possible
   */
  options?: DecisionOptions;



  /**
   * Choix retenu après validation
   *
   * Présent uniquement après passage à "acted"
   */
  chosenOption?: string;



  createdAt: string;

  updatedAt: string;



  status: DecisionStatus;



  /**
   * Date où la décision a été actée
   */
  actedAt?: string;



  /**
   * Date prévue pour refaire un point
   */
  trackingDate?: string;



  /**
   * Date de clôture finale
   */
  completedAt?: string;



  /**
   * Retour utilisateur après expérience
   */
  reviewNote?: string;



  /**
   * Niveau de satisfaction après coup
   */
  satisfaction?: DecisionSatisfaction;



  /**
   * Permet de restaurer une décision archivée
   */
  archivedFromStatus?: ActiveDecisionStatus;

};




export type DecisionScore = {

  /**
   * Nombre d'arguments contre
   */
  conCount: number;



  /**
   * Message UX généré selon l'équilibre
   */
  message: string;



  /**
   * Pourcentage affiché dans la jauge
   */
  percentage: number;



  /**
   * Nombre d'arguments pour
   */
  proCount: number;



  /**
   * Total des arguments
   */
  totalCount: number;



  trend:
    | 'positive'
    | 'negative'
    | 'neutral';

};
