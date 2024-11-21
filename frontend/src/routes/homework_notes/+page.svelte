<script lang="ts">
	import { onMount } from "svelte"; // Я использую onMount для того тчо загрузить заметки при первом рендере компонента
	import { goto } from "$app/navigation";
	// Объект заметки
	interface Note {
		id: string;
		date: string;
		name: string;
		content: string;
	}

	function navigateToPost(id: string) {
		goto(`/homework_notes/${id}`);
	}

	// Массив объектов заметок
	let notes: Note[] = [];
	onMount(() => {
		const storedNotes = localStorage.getItem("notes");
		if (storedNotes) {
			try {
				notes = JSON.parse(storedNotes);
			} catch (error) {
				console.error("Ошибка при парсинге заметок:", error);
			} //
		}
	});

	// Переменная для открытия полей ввода параметров новой заметки
	let showInputFields = false;
    let nameInput : string = "";
    let contentInput :string = "";
	// Функция создания новой заметки
    function createNote(nameInput: string, contentInput: string): void {
		
		if (!nameInput || !contentInput || !nameInput.trim() || !contentInput.trim()) {
			console.log("Имя и контент не могут быть пустыми.");
			return;
		}
		let note: Note = {
			id: crypto.randomUUID(),
			date: (new Date()).toISOString(),
			name: nameInput,
			content: contentInput
		};
		notes = [...notes, note]; // добавление новой заметки в массив
		localStorage.setItem("notes", JSON.stringify(notes)); // добавление в localStorage
		console.log("Added");
		nameInput = ""; // очищаю поля ввода
		contentInput = "";
		showInputFields = false;
	}

	// Функция удаления заметки по ID
	function deleteNote(noteId: string): void {
		notes = notes.filter(note => note.id !== noteId);
		localStorage.setItem("notes", JSON.stringify(notes));
	}
	// Функция для сохранения заметки по клавише Enter
	function handleEnter(event: KeyboardEvent): void {
		if (event.key == "Enter") {
			createNote(nameInput, contentInput);
		}
	}

	// Переменная для поля поиска заметки
	let searchedNote: string = "";


    async function doFunc() {
        let promise = fetch("https://notes.clayenkitten.dev/user/login", {
            method: "POST", 
            body: JSON.stringify({login : "qquerell"}),
            headers: {
                "Content-Type": "application/json"
            }
        });
        let response = await promise;
        let obj = await response.json();
        console.log(obj.token); 
    }


</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="main">
	<section class="main-menu">
		<button class="create-note-button" on:click={() => (showInputFields = true)}
			>Добавить заметку</button
		>

		{#if notes.length > 0}
			<div class="search">
				<input class="search-input" placeholder="Поиск по имени" bind:value={searchedNote} />
			</div>

			<div class="notes-list">
				{#each notes as note}
					{#if note.name.toLowerCase().includes(searchedNote.toLowerCase()) && searchedNote !== ""}
						<div class="buttons-container">
							<button class="note-item" on:click={() => navigateToPost(note.id)}
								>{note.name.slice(0, 23)} - {note.date}</button
							>
							<button class="close-icon" aria-hidden="true" on:click={() => deleteNote(note.id)}
								>Удалить</button
							>
						</div>
					{/if}
				{/each}
			</div>

			<h2>Список заметок:</h2>
			<div class="notes-list">
				{#each notes as note}
					<div class="buttons-container">
						<button class="note-item" on:click={() => navigateToPost(note.id)}
							>{note.name.slice(0, 23)} - {note.date.slice(0, 10)}</button
						>
						<button class="close-icon" aria-hidden="true" on:click={() => deleteNote(note.id)}
							>Удалить</button
						>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="create-note {showInputFields ? 'show' : ''}">
		<div class="create-note-items">
			<button class="close" on:click={() => (showInputFields = false)}>&times</button>
			{#if showInputFields}
				Имя заметки <input
					type="text"
					name=""
					placeholder="Введите имя"
					on:keydown={handleEnter}
					id="note-name" bind:value={nameInput}
				/>
				Контент
				<textarea
					name=""
					placeholder="Введите контент заметки"
					on:keydown={handleEnter}
					id="note-content" bind:value={contentInput}
				></textarea>
				<button on:click={() => createNote(nameInput, contentInput)}>Сохранить</button>
			{/if}
		</div>
	</section>
</div>

<style lang="scss">
	$border-radius: 5px;
	$border: 2px solid blue;
	* {
		font-family: "Roboto", sans-serif;
		border-radius: $border-radius;
	}
	.main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
	button,
	input,
	textarea {
		border: $border;
		border-radius: $border-radius;
		padding: 5px 5px;
		margin: 5px 5px;
		cursor: pointer;
	}
	.search-input {
		margin: 5px 5px;
		width: 250px;
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
	//////////////////
	.create-note {
		display: none; /* Скрываем по умолчанию */
		position: fixed; /* Фиксируем позицию */
		top: 50%; /* Центрируем по вертикали */
		left: 50%; /* Центрируем по горизонтали */
		transform: translate(-50%, -50%); /* Центрирование с помощью трансформации */
		background-color: white; /* Белый фон */
		border-radius: 8px; /* Скругление углов */
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); /* Тень для эффекта глубины */
		padding: 20px; /* Внутренние отступы */
		z-index: 1000; /* Поверх других элементов */
	}
	.create-note.show {
		display: block;
	}
	.close {
		background: none; /* Без фона */
		border: none; /* Без границы */
		font-size: 24px; /* Размер шрифта */
		cursor: pointer; /* Курсор в виде указателя */
		position: absolute; /* Абсолютное позиционирование для размещения в углу */
		top: 10px; /* Отступ сверху */
		right: 10px; /* Отступ справа */
	}
	.close:hover,
	.close:focus {
		color: black;
		text-decoration: none;
		cursor: pointer;
	}
	input[type="text"],
	textarea {
		resize: none;
		overflow: hidden;
		min-height: 50px; /* Минимальная высота */
		max-height: 300px; /* Максимальная высота */
		width: calc(100% - 20px); /* Ширина с учетом отступов */
		padding: 10px; /* Внутренние отступы */
		margin-top: 10px; /* Отступ сверху для разделения элементов */
		border: 1px solid #ccc; /* Светло-серая граница */
		border-radius: 4px; /* Скругление углов */
		font-size: 16px; /* Размер шрифта */
	}
	/////////////////
	.notes-list {
		display: flex;
		flex-direction: column;
		align-items: right;
	}

	.buttons-container {
		display: flex;
		flex-direction: flex-start;
	}

	.note-button {
		margin-right: 10px;
		overflow: hidden;
		width: 200px;
	}
	.close-icon {
		display: none; /* Скрыть крестик по умолчанию */
	}
	.buttons-container:hover .close-icon {
		display: block;
	}
</style>
