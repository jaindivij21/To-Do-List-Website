// Get todays date

// Documentation : https://nodejs.org/dist/latest-v14.x/docs/api/modules.html#modules_the_module_object
// we are not activating the function, just exporting it.
// I am using 2 ways to pass the functions for your understanding 
module.exports = {
    getDate: getDate,
    getDay: () => {
        const today = new Date(); // Date datatype

        const options = {
            weekday: "long",
        };

        return today.toLocaleDateString("en-US", options); // converts todays date into a string acc to options.
    }
};

function getDate() {
    const today = new Date(); // Date datatype

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    return today.toLocaleDateString("en-US", options); // converts todays date into a string acc to options.
}

// Another way
module.exports.getMonth = () => {
    const today = new Date();

    const options = {
        month: "long"
    };

    return today.toLocaleDateString("en-US", options);
}