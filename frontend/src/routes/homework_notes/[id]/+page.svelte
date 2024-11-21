<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte"; // Я использую onMount для того тчо загрузить заметки при первом рендере компонента

	let { id } = $page.params;

	interface Note {
		id: string;
		date: string;
		name: string;
		content: string;
	}
	// куча переменных для сохранения и отмены изменений
	let notes: Note[] = [];
	let note: Note | undefined;
	let currentNoteName: string = "";
	let currentNoteContent: string = "";
	let noteName: string = "";
	let noteContent: string = "";

	onMount(() => {
		const storedNotes = localStorage.getItem("notes");
		if (storedNotes) {
			try {
				notes = JSON.parse(storedNotes);
				note = notes.find(note => note.id === id);
				if (note) {
					noteName = note.name;
					noteContent = note.content;
					currentNoteName = note.name;
					currentNoteContent = note.content;
				}
			} catch (error) {
				console.error("Ошибка при парсинге заметок:", error);
			}
		}
	});

	function editNote(): void {
		if (!note) return; // Проверка на наличие заметки

		// Получение значений из инпутов
		note.name = currentNoteName;
		note.content = currentNoteContent;
		noteName = note.name;
		noteContent = note.content;
    let note_ = note
		// Обновление массива заметок
		notes = notes.map(n => (n.id === note_.id ? note_ : n));

		// Сохранение обновленных заметок в localStorage
		localStorage.setItem("notes", JSON.stringify(notes));
	}
	// отмена изменений
	function undoEdit(): void {
		if (note) {
			currentNoteName = noteName;
			currentNoteContent = noteContent;
		}
	}
	// удаление заметки
	function deleteNote(noteId: string): void {
		notes = notes.filter(note => note.id !== noteId);
		localStorage.setItem("notes", JSON.stringify(notes));
    goto('/homework_notes');
}
</script>

<section class="main">
	{#if note}
		<div class="main-menu">
			<label for="note-name">Название заметки:</label>
			<input
				type="text"
				bind:value={currentNoteName}
				style="font-size: 24px;"
				id="note-name"
				required
			/>
			<label for="note-date">Дата создания заметки:</label>
			<label for="note-date" style="font-size: 24px; margin: 5px 5px;"
				>{note.date.slice(0, 10)}</label
			>
			<label for="note-content">Текст заметки:</label>
			<textarea bind:value={currentNoteContent} style="font-size: 20px;" id="note-content" required
			></textarea>
			<button on:click={editNote}>Сохранить</button>
			<button on:click={undoEdit}>Отменить изменения</button>
			<button on:click={() => deleteNote(note.id)}>Удалить</button>
		</div>
	{/if}
	<a href="/homework_notes">Назад к списку заметок</a>
</section>

<style lang="scss">
	$border-radius: 5px;
	$border: 2px solid blue;
	* {
		font-family: "Roboto", sans-serif;
		border-radius: $border-radius;
	}

	input,
	textarea {
		border: $border;
		border-radius: $border-radius;
		padding: 5px 5px;
		margin: 5px 5px;
		cursor: pointer;
	}
	.main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.main-menu {
		display: flex;
		flex-direction: column;
		min-width: 350px;
		min-height: 300px;
		padding: 15px 15px;
		border-radius: $border-radius;
		border: $border;
		background-color: #8bc3ee;
	}
</style>
