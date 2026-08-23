const defaultAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

export function getOperatorAvatarUrl(operatorId: string): string {
  return `/assets/colaboradores/${operatorId}.jpg`;
}

export { defaultAvatarUrl };
