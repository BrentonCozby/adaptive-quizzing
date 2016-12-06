angular.module('QuizFrontEnd', ['ngRoute'])
  .config(function($routeProvider){
    $routeProvider
    .when('/', {
      controller: 'QuizController',
      templateUrl: 'QuizFrontEnd/templates/quiz.html'
    })
    .when('/run-quiz/:topic/:number', {
      controller: 'RunQuizController',
      templateUrl: 'QuizFrontEnd/templates/run-quiz.html'
    });
  })
  .factory('questionsService', ['$http', function($http){
    function getQuestions(topic, number){
      return $http.get(`api/questions/${topic}/${number}`)
        .catch(err=>console.log(err));
    }
    return {getQuestions};
  }])
  .factory('topicsService', ['$http', function($http){
    function getTopics(){
      return $http.get('/api/topics')
        .catch(err=>console.log(err));
    }
    return {getTopics};
  }])
  .controller('QuizController', ["topicsService", "$scope", "$window",
    function(topicsService, $scope, $window){
      console.log("Quiz Controller running");
      $scope.topics = [];
      topicsService.getTopics().then(res=>{
        $scope.topics=res.data;
      });
      $scope.startQuiz = function() {
        // grab selected topic
        // get number of questions (user-inputted)
        // redirect page to #/run-quiz/:topic/:number
        $window.location.href = `#/run-quiz/${$scope.selectedTopic}/${$scope.numOfQuestions}`;
      };

  }])
  .controller('RunQuizController', ['$scope', 'questionsService', '$routeParams', '$timeout', '$location',
    function($scope, questionsService, $routeParams, $timeout){
      console.log("RunQuizController running...");

      let {topic, number} = $routeParams;
      let correctMessage = document.getElementById('correctMessage');
      let wrongMessage = document.getElementById('wrongMessage');
      let answersContainer = document.getElementById('answersContainer');
      let textAnswer = document.getElementById('textAnswer');
      let resultsContainer = document.getElementById('resultsContainer');
      let checkAnswerButton = document.getElementById('checkAnswer');

      $scope.questions = [];
      $scope.currentQuestion = 0;
      $scope.correct = 0;
      $scope.wrong = false;
      questionsService.getQuestions(topic, number)
      .then(res=>{
        $scope.questions=res.data;

        $scope.isAdaptive = $scope.questions[$scope.currentQuestion].questionType;
        $scope.correctAnswerIndex = $scope.questions[$scope.currentQuestion].answerIndex;
        $scope.correctAnswerValue = $scope.questions[$scope.currentQuestion].answerChoices[$scope.correctAnswerIndex];

        if($scope.isAdaptive === "adaptive") {
          textAnswer.classList.remove('hide');
          answersContainer.classList.add('hide');
        }
        else {
          textAnswer.classList.add('hide');
          answersContainer.classList.remove('hide');
        }
      });

      textAnswer.addEventListener('keydown', function(e) {
        if(e.keyCode === 13) $scope.checkAnswer();
      });

      $scope.checkAnswer = function(){
        if(textAnswer.value === "" && $scope.isAdaptive === "adaptive") return;
        $scope.correctAnswerElement = getLabelsByValue($scope.correctAnswerValue)[0];

        if($scope.isAdaptive === "adaptive") {
          if(textAnswer.value === $scope.correctAnswerValue) {
            onCorrectAnswer();
          }
          else {
            onWrongTextAnswer();
            $scope.isAdaptive = 'mc';
          }
        }
        else {
          let answers = document.getElementsByName('answerChoices');
          for (let i = 0, length = answers.length; i < length; i++) {
            if (answers[i].checked) {
              if(answers[i].value == $scope.correctAnswerValue) {
                onCorrectAnswer();
              }
              else {
                onWrongMCAnswer();
              }
              break;
            }
          }
        }

        function showGradingMessage(messageType) {
          messageType.classList.add('showMessage');
          $timeout(function() {
            messageType.classList.remove('showMessage');
          }, 1200);
        }

        function loadNextQuestion() {
          $scope.currentQuestion++;
          // if End of quiz
          if($scope.currentQuestion >= $scope.questions.length) {
            onEndOfQuiz();
            return false;
          }

          $scope.isAdaptive = $scope.questions[$scope.currentQuestion].questionType;
          $scope.correctAnswerIndex = $scope.questions[$scope.currentQuestion].answerIndex;
          $scope.correctAnswerValue = $scope.questions[$scope.currentQuestion].answerChoices[$scope.correctAnswerIndex];
          textAnswer.value = "";

          if($scope.isAdaptive === "adaptive") {
            textAnswer.classList.remove('hide');
            answersContainer.classList.add('hide');
          }
          else {
            textAnswer.classList.add('hide');
            answersContainer.classList.remove('hide');
          }
        }

        function onCorrectAnswer() {
          showGradingMessage(correctMessage);
          if($scope.wrong) {
            $scope.wrong = false;
          }
          else {
            $scope.correct++;
            $scope.wrong = false;
          }
          $timeout(loadNextQuestion, 1000);
        }

        function onWrongTextAnswer() {
          showGradingMessage(wrongMessage);
          $timeout(function() {
            answersContainer.classList.remove('hide');
            textAnswer.classList.add('hide');
          }, 1000);
        }

        function onWrongMCAnswer() {
          $scope.correctAnswerElement.classList.add('correctAnswer');
          $scope.wrong = true;
          showGradingMessage(wrongMessage);
        }

        function onEndOfQuiz() {
          console.log('end of quiz');
          $scope.grade = `${$scope.correct} / ${$scope.questions.length}`;
          $scope.gradePercent = (Math.round($scope.correct / $scope.questions.length * 100)).toFixed(1);
          resultsContainer.style.display = 'block';
          checkAnswerButton.classList.add('hide');
          textAnswer.classList.add('hide');
        }

        function getLabelsByValue(value) {
            var lables = document.getElementsByTagName("label");
            var results = [];
            for(var i = 0; i < lables.length; i++) {
              if(lables[i].textContent == value) results.push(lables[i]);
            }
            return results;
        }
        //check the ng-model corresponding to the angular radio group
        //against $scope.questions[$scope.currentQuestion].answerChoices[$scope.questions[$scope.currentQuestion].answerIndex]
      };
    }
  ]);
