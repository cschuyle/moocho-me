package com.dragnon.moocho.api
import org.apache.lucene.analysis.Analyzer
import org.apache.lucene.analysis.LowerCaseFilter
import org.apache.lucene.analysis.TokenStream
import org.apache.lucene.analysis.core.LetterTokenizer
import org.apache.lucene.analysis.miscellaneous.ASCIIFoldingFilter

class AccentedAnalyzer : Analyzer() {

    override fun createComponents(fieldName: String): TokenStreamComponents {
        val tokenizer = LetterTokenizer()
        return TokenStreamComponents(
            tokenizer,
            ASCIIFoldingFilter(
                LowerCaseFilter(
                    tokenizer
                )
            )
        )
    }

    override fun normalize(fieldName: String?, `in`: TokenStream): TokenStream =
        LowerCaseFilter(`in`)
}
