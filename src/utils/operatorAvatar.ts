const defaultAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

const localAvatarByName: Record<string, string> = {
    alexcardoso: 'Alex_Cardoso.jpg',
    alexandre: 'Alexandre.jpg',
    felipegalves: 'Felipe_Galves.jpg',
    jadsonoliveira: 'Jadson_Oliveira.jpg',
    jose: 'Jose.jpg',
    karinadesouza: 'Karina_de_Souza.jpg',
    leandrosilva: 'Leandro.jpg',
    lucasalves: 'Lucas_Alves.jpg',
    luislaerte: 'Luis_Laerte.jpg',
    marcos: 'Marcos.jpg',
    nilson: 'Nilson.jpg',
    pedroandreassi: 'Pedro_Andreassi.jpg',
    pedrolima: 'Pedro_Lima.jpg',
    renato: 'Renato.jpg',
    srluis: 'Sr._Luis.jpg',
    victorsoares: 'Victor_Soares.jpg',
    viniciuslopes: 'Vinicius_Lopes.jpg'
};

function normalizeName(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
}

export function getOperatorAvatarUrl(operatorId: string, operatorName?: string): string {
    const fileName = operatorName ? localAvatarByName[normalizeName(operatorName)] : undefined;
    return `/assets/colaboradores/${fileName || `${operatorId}.jpg`}`;
}

export { defaultAvatarUrl };
