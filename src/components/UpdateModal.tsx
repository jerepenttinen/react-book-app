import { useState } from 'react';

// Usage: <UpdateModal onNewUpdate={console.log} currentPage={3} totalPages={100} />
function UpdateModal({
    currentPage,    // Current page number.
    totalPages,     // Total number of pages in the book.
    shown,          // Is modal visible? (true/false) value, default true.
    onNewUpdate,    // Callback that takes an object with keys updateText and pageNumber.
                    // E.g. { updateText: "made it to page 5", pageNumber: "5" }
    onCancel,       // Callback that handles Cancel. Default behavior is to hide modal.
    onDone          // Callback that handles Olen valmis. Default behavior is to hide modal.
})
{
    let [isShown, setShown] = useState(shown ?? true);

    currentPage ??= 1;
    totalPages ??= 1;
    onCancel ??= setShown.bind(this, false);
    onDone ??= setShown.bind(this, false);

    function onFormSubmit(e)
    {
        e.preventDefault();
        if (onNewUpdate instanceof Function)
        {
            const formData = new FormData(e.target);
            const obj = Object.fromEntries(formData);
            onNewUpdate(obj);
        }
        else
        {
            throw new Error("No onNewUpdate handler");
        }
    }

    if (!isShown)
        return null;

    return (<div className="absolute top-0 left-0 right-0 bottom-0 bg-base-300 z-40 bg-opacity-50">
    <form className="flex flex-col gap-4 border rounded-3xl px-6 py-3 relative mx-auto mt-20 bg-base-100 w-[32rem]" onSubmit={onFormSubmit}>
        <div className="flex flex-row justify-between">
            <div>
                Sivu
                <input name="pageNumber" size="3" className="input" type="number" min="1" max={totalPages} defaultValue={currentPage} />
                / {totalPages} 
            </div>
            <input type="button" className="btn" value="Olen valmis" onClick={onDone} />
        </div>
        <textarea name="updateText" className="input w-full h-24" placeholder="Päivitys teksti tähän"></textarea>
        <div className="flex flex-row gap-4 justify-end">
            <input type="button" className="btn" onClick={onCancel} value="Peruuta" />
            <input type="submit" className="btn rounded-md bordered border-medium" value="Päivitä" />
        </div>
    </form>
    </div>);
}

export default UpdateModal;
