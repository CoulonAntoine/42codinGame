/**
 * ENUMS
 */

enum ActionType {
	MOVE,
	THROW,
	SPELL
}

enum EntityType {
	WIZARD = 'wizard',
	OPPONENT_WIZARD = 'opponent wizard',
	SNAFFLE = 'snaffle',
	BLUDGER = 'bludger'
}

/**
 * ABSTRACT CLASSES
 */

abstract class Control {

	public static move(position: Point, thrust: number) {
		console.log('MOVE ' + Math.round(position.x) + ' ' + Math.round(position.y) + ' ' + Math.round(thrust));
	}

	public static throw(position: Point, power: number) {
		console.log('THROW ' + Math.round(position.x) + ' ' + Math.round(position.y) + ' ' + Math.round(power));
	}

	public static spell(id: number, position: Point, magic: number) {
		console.error(magic);
		console.log('WINGARDIUM ' + id + ' ' + Math.round(position.x) + ' ' + Math.round(position.y) + ' ' + Math.round(magic));
	}

}

/**
 * CLASSES
 */

class Action {

	public type: ActionType;
	public target: Point;

	public constructor(type: ActionType, target: Point) {
		this.type = type;
		this.target = target;
	}

	public apply(): void {
	}

}

class Move extends Action {

	public thrust: number;

	public constructor(target: Point, thrust: number) {
		super(ActionType.MOVE, target);
		this.thrust = thrust;
	}

	public apply(): void {
		Control.move(this.target, this.thrust);
	}
}

class Throw extends Action {

	public power: number;

	public constructor(target: Point, power: number) {
		super(ActionType.THROW, target);
		this.power = power;
	}

	public apply(): void {
		Control.throw(this.target, this.power);
	}
}

class Spell extends Action {

	public id: number;
	public magic: number;

	public constructor(target: Point, id: number, magic: number) {
		super(ActionType.SPELL, target);
		this.id = id;
		this.magic = magic;
	}

	public apply(): void {
		Control.spell(this.id, this.target, this.magic);
	}

}

class Vector {

	public x: number;
	public y: number;

	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	toString() {
		return ('v(' + this.x + ';' + this.y + ')');
	}

}

class Point {

	public x: number;
	public y: number;

	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public distanceTo(point: Point): number {
		return (Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2)));
	}

	public applyVector(vector: Vector): Point {
		return (new Point(this.x + vector.x, this.y + vector.y));
	}

	toString() {
		return ('(' + this.x + ';' + this.y + ')');
	}

}

class Entity {

	public id: number;
	public type: EntityType;
	public position: Point;
	public velocity: Vector;

	public constructor(id: number, type: EntityType, position: Point, velocity: Vector) {
		this.id = id;
		this.type = type;
		this.position = position;
		this.velocity = velocity;
	}

	public nextPosition(): Point {
		return (this.position.applyVector(this.velocity));
	}

	public toString() {
		return ('ENTITY id:' + this.id + ' type:' + this.type + ' position:' + this.position.toString() + ' velocity:' + this.velocity.toString());
	}

}

class Wizard extends Entity {

	public grabbing: boolean;

	public constructor(id: number, position: Point, velocity: Vector, state: number) {
		super(id, EntityType.WIZARD, position, velocity);
		this.grabbing = Boolean(state);
	}

}

class OpponentWizard extends Entity {

	public grabbing: boolean;

	public constructor(id: number, position: Point, velocity: Vector, state: number) {
		super(id, EntityType.OPPONENT_WIZARD, position, velocity);
		this.grabbing = Boolean(state);
	}

}

class Snaffle extends Entity {

	public grabbed: boolean;

	public constructor(id: number, position: Point, velocity: Vector, state: number) {
		super(id, EntityType.SNAFFLE, position, velocity);
		this.grabbed = Boolean(state);
	}

}

class Bludger extends Entity {

	public target: number;

	public constructor(id: number, position: Point, velocity: Vector, state: number) {
		super(id, EntityType.BLUDGER, position, velocity);
		this.target = state;
	}

}

class Team {

	public id: number;
	public score: number;
	public magic: number;
	public goal: Point;
	public wizardId: number;

	public constructor(id: number) {
		this.id = id;
		this.score = 0;
		this.magic = 0;
		this.goal = id ? new Point(16000, 3750) : new Point(0, 3750);
		this.wizardId = id ? 2 : 0;
	}

	public update(score: number, magic: number): void {
		this.score = score;
		this.magic = magic;
	}

}

class Game {

	public me: Team;
	public opponent: Team;
	public entities: Entity[];
	public actions: Action[];

	public constructor(team: number) {
		this.me = new Team(team);
		this.opponent = new Team(Number(!team));
		this.actions = new Array(null, null);
	}

	public update(): void {
		var inputs: string[] = readline().split(' ');
		this.me.update(parseInt(inputs[0]), parseInt(inputs[1]));
		inputs = readline().split(' ');
		this.opponent.update(parseInt(inputs[0]), parseInt(inputs[1]));
		this.entities = [];
		const entitiesNumber: number = parseInt(readline());
		for (let i = 0; i < entitiesNumber; i++) {
			inputs = readline().split(' ');
			const position: Point = new Point(parseInt(inputs[2]), parseInt(inputs[3]));
			const velocity: Vector = new Vector(parseInt(inputs[4]), parseInt(inputs[5]));
			const state: number = parseInt(inputs[6])
			switch (inputs[1]) {
				case 'WIZARD':
					this.entities.push(new Wizard(parseInt(inputs[0]), position, velocity, state));
					break;
				case 'OPPONENT_WIZARD':
					this.entities.push(new OpponentWizard(parseInt(inputs[0]), position, velocity, state));
					break;
				case 'SNAFFLE':
					this.entities.push(new Snaffle(parseInt(inputs[0]), position, velocity, state));
					break;
				case 'BLUDGER':
					this.entities.push(new Bludger(parseInt(inputs[0]), position, velocity, state));
					break;
			}
		}
		this.actions = new Array(null, null);
	}

	public setAction(id: number, action: Action) {
		this.actions[id] = action;
	}

	public getClosestEntities(position: Point): Entity[] {
		return (this.entities.slice(0).sort((e1, e2) => e1.position.distanceTo(position) - e2.position.distanceTo(position)));
	}

	public getClosestSnaffles(position: Point): Snaffle[] {
		return (this.getClosestEntities(position).filter(e => e.type == EntityType.SNAFFLE) as Snaffle[]);
	}

	public process(): void {
		const w0: Wizard = this.entities.find(e => e.id == 0 + this.me.wizardId) as Wizard;
		const w1: Wizard = this.entities.find(e => e.id == 1 + this.me.wizardId) as Wizard;
		const w0Closest: Snaffle[] = this.getClosestSnaffles(w0.position);
		const w1Closest: Snaffle[] = this.getClosestSnaffles(w1.position);

		if (this.getClosestSnaffles(w0.position).length == 1) {
			this.setAction(0, new Move(w0Closest[0].nextPosition(), 150));
			this.setAction(1, new Move(w1Closest[0].nextPosition(), 150));
		} else if (w0Closest[0].id == w1Closest[0].id) {
			const closest: number = w0.position.distanceTo(w0Closest[0].position) > w1.position.distanceTo(w1Closest[0].position) ? 1 : 0;
			this.setAction(0, new Move(w0Closest[closest ? 0 : 1].nextPosition(), 150));
			this.setAction(1, new Move(w1Closest[closest ? 1 : 0].nextPosition(), 150));
		} else {
			this.setAction(0, new Move(this.getClosestSnaffles(w0.position)[0].nextPosition(), 150));
			this.setAction(1, new Move(this.getClosestSnaffles(w1.position)[0].nextPosition(), 150));
		}

		if (this.me.magic > 32) {
			console.error('enough magic');
			const target: Snaffle = this.getClosestSnaffles(this.me.score > this.opponent.score ? this.me.goal : this.opponent.goal)[0];
			if (!w0.grabbing && !w1.grabbing) {
				console.error('all available');
				const closest: number = w0.position.distanceTo(target.nextPosition()) > w1.position.distanceTo(target.nextPosition()) ? 1 : 0;
				game.setAction(closest, new Spell(this.opponent.goal, target.id, 33));
			} else if (!w0.grabbing) {
				console.error('w0 available');
				game.setAction(0, new Spell(this.opponent.goal, target.id, 33));
			} else if (!w1.grabbing) {
				console.error('w1 available');
				game.setAction(1, new Spell(this.opponent.goal, target.id, 33));
			} else {
				console.error('none available');
			}
		}

		if (w0.grabbing) {
			this.setAction(0, new Throw(this.opponent.goal, 500));
		}
		if (w1.grabbing) {
			this.setAction(1, new Throw(this.opponent.goal, 500));
		}
	}

	public apply(): void {
		this.actions[0].apply();
		this.actions[1].apply();
	}

}

/**
 * GAME LOOP
 */

const game: Game = new Game(parseInt(readline()));

while (true) {
	game.update();
	game.process();
	game.apply();
}
