import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Tasks } from '../api/tasks.js';
import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
import Papa from 'papaparse';
import Popup from 'react-popup';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false,
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    Meteor.call('tasks.insert', text);

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  handleImportSubmit(event) {
    event.preventDefault();

    const file = ReactDOM.findDOMNode(this.refs.fileInput).files[0];

    Papa.parse(file, {
      step: function (row) {
        console.log('Row:', row.data[0]);
        var newTasks = new String(row.data[0]).trim();
        Meteor.call('tasks.insert',  newTasks);
      },

      complete: function () {
        console.log('All done!');
      },

    });

  }

  toggleHideCompleted() {
    this.setState({
        hideCompleted: !this.state.hideCompleted,
      });
  }

  handleImportButton() {
    importform = (<form className="parseUpload" onSubmit={this.handleImportSubmit.bind(this)} >

      <input
        type="file"
        ref="fileInput"
      />
      <button>
        submit
      </button>
    </form>);
    alert('import form goes here ' + importform);

  }

  handleExportButton() {
    let data = this.props.tasks;
    let downloadCSV = function(csv) {
  		var blob = new Blob([csv]);
  		var a = window.document.createElement("a");
  	    a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
  	    a.download = "tasks.csv";
  	    document.body.appendChild(a);
  	    a.click();
  	    document.body.removeChild(a);
  	}

    var csv = Papa.unparse(data);
    downloadCSV(csv);
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }

    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
      <Task
        key={task._id}
        task={task}
        showPrivateButton={showPrivateButton}
      />
    );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
           <h1>Todo List ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
           <input
             type="checkbox"
             readOnly
             checked={this.state.hideCompleted}
             onClick={this.toggleHideCompleted.bind(this)}
           />
           Hide Completed Tasks
         </label>

           <AccountsUIWrapper />

           { this.props.currentUser ?
             <div>
               <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
                 <input
                   type="text"
                   ref="textInput"
                   placeholder="Type to add new tasks"
                 />
               </form>
               <button onClick={this.handleImportButton.bind(this)}> Import </button>

               <button onClick={this.handleExportButton.bind(this)}> Export </button>

               <form className="parseUpload" onSubmit={this.handleImportSubmit.bind(this)} >

                 <input
                   type="file"
                   ref="fileInput"
                 />
                 <button>
                   submit
                 </button>
               </form>
             </div> : ''
           }
        </header>

        <ul>
          {this.renderTasks()}
        </ul>


      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
}, App);
