import type { Package, Task } from '@prisma/client';

/**
 * Progreso de un paquete. Se DERIVA de las tareas cada vez que se lee: un
 * contador guardado se desincroniza en cuanto alguien borra una tarea.
 *
 * `total` son las tareas efectivamente cargadas y `committed` las prometidas al
 * cliente. Son distintas a propósito: la brecha entre las dos es exactamente lo
 * que falta cargar, y esconderla haría parecer completo un paquete a medio armar.
 */
export function progressOf(
  pkg: Pick<Package, 'committedPieces'>,
  tasks: Pick<Task, 'status'>[]
): { done: number; total: number; committed: number } {
  return {
    done: tasks.filter((task) => task.status === 'DONE').length,
    total: tasks.length,
    committed: pkg.committedPieces,
  };
}
