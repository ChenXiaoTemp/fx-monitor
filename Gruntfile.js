module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-crx');
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.initConfig({
        pluginSrcRoot: 'src/main/plugin',
        manifest: grunt.file.readJSON('src/main/plugin/manifest.json'),
        crx: {
            production: {
                'src': '<%= pluginSrcRoot %>',
                'dest': 'dest/hue-speed-monitor-<%= manifest.version %>.crx',
                'privateKey': 'src/main/resources/hue-speed-monitor.pem',
                'options': {
                    'baseURL': 'http://ci.hue.workslan/jenkins/view/company-tools/job/tools-gitlab-merge-adviser/lastSuccessfulBuild/artifact/dest/',
                    'filename': 'hue-speed-monitor-<%= manifest.version %>.crx'
                }
            }
        },
        template: {
            'updates-xml': {
                options: {
                    data: {
                        version: '<%= manifest.version %>'
                    }
                },
                files: {
                    'dest/updates.xml': 'src/main/resources/updates.xml'
                }
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path
                    {src: ['src/main/resources/XGP.exe'], dest: 'dest/', filter: 'isFile', expand: true, flatten: true},
                    {
                        src: ['src/main/resources/install.bat'],
                        dest: 'dest/',
                        filter: 'isFile',
                        expand: true,
                        flatten: true
                    }
                ]
            }
        },
        jsbeautifier: {
            all: {
                src: ['<%= pluginSrcRoot %>/js/**/*.js', '!<%= pluginSrcRoot %>/js/**/*.min.js']
            },
            options: {
                js: {
                    braceStyle: "collapse",
                    breakChainedMethods: false,
                    e4x: false,
                    evalCode: false,
                    indentChar: " ",
                    indentLevel: 0,
                    indentSize: 2,
                    indentWithTabs: false,
                    jslintHappy: false,
                    keepArrayIndentation: false,
                    keepFunctionIndentation: false,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    spaceBeforeConditional: true,
                    spaceInParen: false,
                    unescapeStrings: false,
                    wrapLineLength: 120
                }
            }
        },
        clean: {
            'dest': {
                src: 'dest'
            }
        }
    });

    grunt.registerTask('package', [
        'clean:dest', 'template:updates-xml', 'crx:production', 'copy:main'
    ]);
};
