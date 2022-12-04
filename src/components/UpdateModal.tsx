import { useState } from 'react';

interface UpdateModalParameters
{
    onNewUpdate: (data: UpdateModalUserInput) => any, // Callback that handles new update.
    currentPage?: number,    // Current page number.
    totalPages?: number,     // Total number of pages in the book.
    shown?: boolean,         // Is modal visible? Default true.
    onCancel?: any,          // Callback that handles Cancel. Default behavior is to hide modal.
    onDone?: any             // Callback that handles Olen valmis. Default behavior is to hide modal.
}

export interface UpdateModalUserInput
{
    updateText: string,
    pageNumber: number
}

// Usage: <UpdateModal onNewUpdate={console.log} currentPage={3} totalPages={100} />
export function UpdateModal(params: UpdateModalParameters): JSX.Element | null
{
    let [isShown, setShown] = useState(params.shown ?? true);

    let currentPage = params.currentPage ?? 1;
    let totalPages  = params.totalPages ?? 1;
    let onCancel    = params.onCancel ?? setShown.bind(this, false);
    let onDone      = params.onDone ?? setShown.bind(this, false);

    function onFormSubmit(e: any)
    {
        e.preventDefault();
        if (params.onNewUpdate instanceof Function)
        {
            const formData = new FormData(e.target);
            const obj: UpdateModalUserInput = Object.fromEntries(formData);
            params.onNewUpdate(obj);
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
